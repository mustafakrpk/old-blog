# 🌌 Ürün Yol Haritası — "Knowledge Galaxy" Platformu

> Kişisel bir bilgi grafiğinden, **herkesin kendi gezilebilir bilgi galaksisini
> kurabileceği** global, freemium bir SaaS platformuna evrim planı.

**Marka adı:** `Stelvia` (bu dokümanda platform domaini için `PLATFORM_DOMAIN` placeholder'ı kullanılır)
**Son güncelleme:** 2026-07-18

---

## 🎯 Konumlandırma

**"Turn your knowledge into a universe people can explore."**
Bilginin Linktree'si değil — bilginin **galaksisi**. Tek bir link sayfası değil,
gezilebilir bir evren.

- **Çekirdek wow faktörü:** içeriğin galaksi gibi görünen interaktif grafiği
  (3 mod: `professional / explorer / god_mode`).
- **Büyüme motoru:** görsel viralite — her yayınlanan galaksi paylaşılır ve
  "Made with PLATFORM" rozeti taşır.

### Strateji
1. **Önce creator** (bireyler) ile viral büyü.
2. **Sonra B2B** (ekipler/şirketler) — aynı multi-tenant çekirdeğin üstüne katman.
3. **İş modeli: Freemium abonelik.**

---

## 🧱 Mevcut Durum (dürüst envanter)

| Parça | Teknoloji | Rol |
|---|---|---|
| `front/` | **Vite + React + Tailwind** (static) | Herkese açık **graph görüntüleyici** → `mustafakırpık.com` |
| `back/` | **Next.js** (PM2, port 3000) | **Admin (liste yönetimi)** + API → `admin.mustafakırpık.com` |
| DB | **Neon (serverless Postgres)** + **Drizzle ORM** | `nodes` + `links` tabloları |
| Deploy | Kendi **VPS** (Ubuntu + Plesk + nginx + PM2 + Bun) | — |

**Ölü kalıntılar (fork'tan kalma, silinecek):** `edgedb/`, `dbschema/`,
muhtemelen `cli/` ve `mobile/`. Bunlar kafa karıştırıyor; EdgeDB **kullanılmıyor**.

**Mevcut sınır:** Sistem **tek graph** varsayıyor (senin graph'ın). Tablolarda
kullanıcı/kiracı (tenant) kavramı yok.

---

## 🔒 Kilitlenmiş Teknik Kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Veritabanı | **Neon + Drizzle'da kal** | Zaten Postgres'teyiz; migration yok |
| Multi-tenancy | **Paylaşımlı DB + `workspace_id` kolonu + app-level scoping** | En basit, en ucuz, standart |
| Auth | **Better-Auth (self-host)** | Sahiplik + sabit maliyet; organizations & Stripe plugin'leri var |
| Billing | **Stripe** (Checkout + Customer Portal + webhooks) | Standart |
| Routing (MVP) | **Path tabanlı** `PLATFORM_DOMAIN/u/<kullanici>` | Wildcard DNS/SSL derdi yok |
| Özel domain / subdomain | **Sonra, Pro özelliği** | `mustafakırpık.com` bunun canlı örneği |
| Deploy | **Kendi VPS'inde kal** | Maliyet kontrolü; Better-Auth ile uyumlu |
| App yapısı | **front (viewer) + back (admin) ayrımını koru** | Çalışıyor; consolidation gereksiz |

---

## 🏗️ Hedef Mimari (multi-tenant)

```
PLATFORM_DOMAIN                → Landing + kayıt/giriş (Better-Auth)
PLATFORM_DOMAIN/u/<kullanici>  → O kullanıcının public galaksisi (front/ Vite viewer)
app.PLATFORM_DOMAIN (veya /app)→ Giriş yapan kullanıcının admin paneli (back/ Next)
PLATFORM_DOMAIN/api/graph?u=…  → Tenant-scoped graph verisi (API)

mustafakırpık.com              → Kurucunun vitrini = "custom domain" Pro örneği (Tenant #1)
```

- **front/ (Vite viewer):** URL'den tenant kimliğini alır, o tenant'ın grafiğini
  API'den çeker ve çizer. Tüm kullanıcıların ortak görüntüleyicisi olur.
- **back/ (Next admin):** Better-Auth burada. Giriş yapan kullanıcı **yalnızca
  kendi** node/link listesini yönetir.
- **API:** Her sorgu `workspace_id` ile izole edilir.

---

## 🗄️ Hedef Veri Modeli

```
users        → id, email, name, image, created_at        (Better-Auth)
sessions     → ...                                        (Better-Auth)
accounts     → ...                                        (Better-Auth)

workspaces   → id, owner_id (→users), slug (public URL), plan, custom_domain?
nodes        → + workspace_id (FK, index)   ⟵ EKLENECEK
links        → + workspace_id (FK, index)   ⟵ EKLENECEK
```

**İzolasyon iki katman:**
1. **App-level scoping** (MVP): her Drizzle sorgusunda `.where(eq(workspace_id, …))`.
2. **Postgres RLS** (para almadan önce): kod bir yeri unutsa bile DB sızdırmaz.

---

## 🛣️ Fazlar

### Faz 0 — Temizlik & hazırlık
- [ ] Ölü klasörleri sil: `edgedb/`, `dbschema/` (+ kullanılmıyorsa `cli/`, `mobile/`).
- [ ] `DEPLOY.md` güncel mi kontrol et.
- [ ] `ROADMAP.md` (bu dosya) repoya işle.

### Faz 1 — Multi-tenant çekirdek ⭐ (en kritik, en riskli)
- [ ] **Better-Auth kurulumu** (`back/`): email + Google, Drizzle adapter.
- [ ] Şemaya `users/sessions/accounts` + `workspaces` ekle (Drizzle migration).
- [ ] `nodes` ve `links`'e `workspace_id` ekle; mevcut veriyi Tenant #1'e bağla.
- [ ] **Tüm action/query'leri workspace'e göre filtrele** (graph + admin CRUD).
      → Güvenlik açısından en hassas adım; sızıntı = ürün biter.
- [ ] **Tenant routing:** `front/` viewer `/u/<slug>` okuyup API'ye `?u=<slug>` geçsin;
      `back/` admin yalnızca giriş yapan kullanıcının workspace'ini göstersin.
- [ ] Kabul kriteri: iki ayrı hesap, birbirinin verisini **asla** göremez.

### Faz 2 — Onboarding & "60 saniyede ilk galaksi"
- [ ] Kayıt → otomatik workspace + boş graph oluşturma.
- [ ] **Şablonlar:** Araştırmacı / Portfolyo / Öğrenci / İkinci Beyin (hazır iskelet).
- [ ] **İçe aktarma:** Markdown / Obsidian vault → otomatik node+link.
      (Obsidian kullanıcıları en büyük hazır büyüme kanalı.)
- [ ] Admin'i "node edit" teknik dilinden creator dostu editöre yumuşat.

### Faz 3 — Viral büyüme döngüsü
- [ ] **"Made with PLATFORM" rozeti** (ücretsiz graph'larda, tıklanınca kayda gider).
- [ ] **OG paylaşım kartları:** her graph için otomatik güzel görsel (Twitter/LinkedIn).
- [ ] **Explore sayfası:** herkese açık graph'lar gezilebilsin (SEO + ilham + "ben de yaparım").

### Faz 4 — Para kapıları (Freemium / Stripe)
- [ ] Stripe Checkout + Customer Portal + webhook (plan senkronu `workspaces.plan`).
- [ ] Özellik bayrakları (free vs pro kapıları).
- [ ] **Postgres RLS**'i devreye al (para almadan önce sertleştirme).

### Faz 5 — B2B köprüsü
- [ ] Better-Auth **organizations**: workspace → takım, davet, roller.
- [ ] Takım analytics, SSO, marka teması.
- [ ] Koltuk başı (Team) planı.

---

## 💳 Fiyatlandırma (taslak)

| | **Free** | **Pro (~$9/ay)** | **Team (B2B, sonra)** |
|---|---|---|---|
| Graph sayısı | 1 | sınırsız | workspace + koltuklar |
| Node limiti | ~100 | sınırsız | sınırsız |
| Domain | `/u/<slug>` | **özel domain** | özel domain |
| "Made with" rozeti | var | **kaldırılır** | kaldırılır |
| Temalar | temel | **premium** | marka teması |
| Analytics | yok | **var** | takım analytics |
| Roller / SSO | — | — | **var** |

Para alınan üç ana değer: **özel domain + rozet kaldırma + premium temalar.**

---

## ❓ Açık Kararlar

- [ ] **Marka adı + domain** (`PLATFORM_DOMAIN`). Her şeyin çıpası; netleşince
      bu dokümandaki placeholder'lar güncellenir.
- [ ] Admin'i ayrı subdomain (`app.PLATFORM_DOMAIN`) mi yoksa path (`/app`) mi?
- [ ] Subdomain (`<kullanici>.PLATFORM_DOMAIN`) ne zaman açılır? (Pro ile birlikte mi?)

---

## ✅ Sıradaki Adım

**Faz 1'in kod seviyesindeki teknik tasarımı:** Drizzle şema değişikliği,
Better-Auth kurulumu, workspace izolasyon noktalarının tek tek çıkarılması.
