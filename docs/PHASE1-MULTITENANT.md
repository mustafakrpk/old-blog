# Faz 1 — Multi-tenant Çekirdek (Kod Seviyesi Teknik Tasarım)

> Amaç: tek-graph sistemini, her kullanıcının izole kendi graph'ına sahip olduğu
> multi-tenant bir yapıya çevirmek. Auth = **Better-Auth (self-host)**, DB =
> **Neon + Drizzle**, izolasyon = **app-level `workspace_id` scoping**.
> İlgili genel plan: [../ROADMAP.md](../ROADMAP.md)

---

## 0. Koddaki mevcut engeller (gerçek tespitler)

| # | Sorun | Yer | Etki |
|---|---|---|---|
| 1 | Node `id` kullanıcı slug'ı (`my-project`) ve **global PK** | `admin/nodes/node-form.tsx:48` | Farklı kullanıcılar aynı id → **çakışma** |
| 2 | Tek paylaşımlı `ADMIN_PASSWORD` + el yapımı cookie | `lib/auth.ts`, `middleware.ts`, `actions/admin.ts` | Tek admin varsayımı; çoklu kullanıcı yok |
| 3 | Public viewer `?mode=god_mode` çekiyor | `front/.../HomeAuthRoute.tsx:59` | **Gizli node'lar herkese açık** sızıyor |
| 4 | `neon-http` stateless sürücü | `db/index.ts` | RLS için session değişkeni tutulamaz (Faz 4 notu) |

---

## 1. Karar: Node ID Stratejisi → **Composite PK** `(workspace_id, id)`

- `nodes` PK = `(workspace_id, id)`. `id` slug olarak kalır, **workspace içinde** unique.
- `links` → `(workspace_id, source, target)`; FK'ler workspace içine kapanır.
- Mevcut link'lerin `source/target` slug değerlerine **dokunulmaz**, sadece
  `workspace_id` eklenir. → En az migration riski.

---

## 2. Hedef Şema (Drizzle)

### 2.1 Better-Auth tabloları
Better-Auth'un Drizzle adapter'ı `user`, `session`, `account`, `verification`
tablolarını üretir (CLI ile generate edilir). Bunları elle yazmıyoruz; Better-Auth
şemasından migration çıkarıyoruz.

### 2.2 Workspaces (yeni)
```ts
export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),                      // cuid/uuid
  ownerId: text("owner_id").notNull()               // → user.id (Better-Auth)
    .references(() => user.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),            // public URL: /u/<slug>
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"),     // free | pro | team
  customDomain: text("custom_domain"),              // Pro (sonra)
  defaultMode: visibilityEnum("default_mode")       // public viewer hangi modu görür
    .notNull().default("professional"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
```

### 2.3 nodes / links (değişiklik)
```ts
export const nodes = pgTable("nodes", {
  workspaceId: text("workspace_id").notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  id: text("id").notNull(),                         // slug (workspace içinde unique)
  // ... mevcut alanlar aynı ...
}, (t) => ({
  pk: primaryKey({ columns: [t.workspaceId, t.id] }),
}))

export const links = pgTable("links", {
  workspaceId: text("workspace_id").notNull(),
  source: text("source").notNull(),
  target: text("target").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.workspaceId, t.source, t.target] }),
  sourceFk: foreignKey({ columns: [t.workspaceId, t.source],
    foreignColumns: [nodes.workspaceId, nodes.id] }).onDelete("cascade"),
  targetFk: foreignKey({ columns: [t.workspaceId, t.target],
    foreignColumns: [nodes.workspaceId, nodes.id] }).onDelete("cascade"),
}))
```

---

## 3. Better-Auth Kurulumu (eski auth'u söker)

- [ ] `better-auth` kur; `lib/auth.ts`'i Better-Auth instance'ı ile **değiştir**
      (drizzleAdapter + Neon). Email/şifre + Google provider.
- [ ] `lib/auth-client.ts` (React tarafı) ekle.
- [ ] `app/api/auth/[...all]/route.ts` handler.
- [ ] Better-Auth CLI ile şema generate → Drizzle migration.
- [ ] **Sökülecekler:** `verifyAdminPassword`, `createSessionToken`,
      `isAdminAuthenticated`, `loginAction`, `logoutAction`, `ADMIN_PASSWORD`.
- [ ] `admin/login/page.tsx` → Better-Auth sign-in/up akışına bağla.

### Yardımcı: aktif workspace çözümü
```ts
// lib/tenant.ts
export async function requireWorkspace() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("UNAUTHENTICATED")
  const ws = await db.select().from(workspaces)
    .where(eq(workspaces.ownerId, session.user.id)).limit(1)
  if (!ws[0]) throw new Error("NO_WORKSPACE")
  return ws[0]   // { id, slug, plan, ... }
}
```

---

## 4. İzolasyon Noktaları — değişecek fonksiyonlar (tek tek)

> Kural: **yazılan/okunan her `nodes`/`links` sorgusu `workspace_id` ile
> sınırlanır.** Bir tane unutmak = veri sızıntısı.

### `actions/graph.ts` (public okuma — slug ile)
- [ ] `getGraphData(slug, mode)` → önce slug'tan workspace bul; sorgulara
      `eq(nodes.workspaceId, ws.id)` ekle; `links` de workspace'e göre filtrelensin.
- [ ] **Gizlilik:** public çağrıda `mode` en fazla workspace'in `defaultMode`'u
      kadar açılabilsin; `god_mode` yalnızca sahibi giriş yapmışken.

### `actions/admin.ts` (yazma + sahip okuması — `requireWorkspace()` ile)
Hepsine `const ws = await requireWorkspace()` + `workspace_id` koşulu:
- [ ] `getDashboardStats` — tüm count'lar `where(workspaceId)`
- [ ] `getNodesList` — base query'ye workspace koşulu
- [ ] `getNodeById` — `and(eq(id), eq(workspaceId))`
- [ ] `getNodeLinks` — join + workspace koşulu
- [ ] `getAllNodeTitles` — workspace koşulu
- [ ] `createNode` — `values({ ...data, workspaceId: ws.id })`
- [ ] `updateNode` — `where(and(eq(id), eq(workspaceId)))`
- [ ] `deleteNode` — `where(and(eq(id), eq(workspaceId)))`
- [ ] `createLink` / `deleteLink` — `workspaceId` ekle + koşul
- [ ] `revalidatePath("/")` → tenant-aware path (`/u/<slug>`)

### `app/api/graph/route.ts`
- [ ] `?u=<slug>` parametresi zorunlu; `getGraphData(slug, mode)` çağır.
- [ ] Public default `professional`; `god_mode` sadece oturum sahibine.

### `front/` (Vite viewer)
- [ ] `HomeAuthRoute.tsx`: URL'den slug oku, `?u=<slug>&mode=professional` çağır.
      `god_mode` default'unu **kaldır**.

### `middleware.ts`
- [ ] El yapımı cookie kontrolünü Better-Auth session kontrolüyle değiştir.

---

## 5. Veri Migration'ı (mevcut tek graph → Tenant #1)

1. Migration: tablolara `workspace_id` ekle (önce `NULL` izinli).
2. Seed: kurucu `user` + `workspace` (slug örn. `mustafa`, plan `pro`) oluştur.
3. Backfill: tüm mevcut `nodes`/`links` → bu workspace_id ile güncelle.
4. `workspace_id`'yi `NOT NULL` yap; composite PK + FK'leri uygula.
5. `mustafakırpık.com` → bu workspace'in `customDomain`'i (custom-domain Pro örneği).

---

## 6. Kabul Kriterleri

- [ ] İki ayrı hesap aç; A, B'nin node/link'ini **hiçbir** action/endpoint'ten göremez.
- [ ] B'nin public sayfası (`/u/b`) yalnızca B'nin `professional` node'larını gösterir.
- [ ] Giriş yapmamış ziyaretçi `god_mode` ile gizli node çekemez.
- [ ] Aynı slug'lı node iki farklı workspace'te sorunsuz var olabilir.
- [ ] Eski tek-graph verisi Tenant #1 altında bozulmadan görünür.

---

## 7. Notlar / İleriye

- **RLS (Faz 4):** `neon-http` stateless olduğu için `SET LOCAL`-tabanlı RLS
  zor. Seçenek: RLS'te `neon` WebSocket/pool sürücüsüne geçmek **veya** app-level
  scoping'i tek izolasyon olarak bırakıp testlerle sıkı tutmak.
- **Workspace başına graph sayısı:** şimdilik 1 workspace = 1 graph. Pro'da
  "sınırsız graph" istenirse `graphs` tablosu araya girer (Faz 4 kararı).

---

## Uygulama Sırası (önerilen)

1. Better-Auth kur + eski auth'u sök (henüz izolasyon yok, tek kullanıcı çalışsın).
2. Şema migration + `workspaces` + backfill (Tenant #1).
3. `requireWorkspace()` + `admin.ts` izolasyonu.
4. `graph.ts` + API + `front/` viewer slug'a geçiş + gizlilik düzeltmesi.
5. Kabul kriterleri testleri (iki hesapla sızıntı testi).
