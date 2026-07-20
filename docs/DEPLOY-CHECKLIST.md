# Deploy + Smoke-Test Checklist

Faz 1–5 + landing/explore/temalar/analytics/takım/özel domain birikti. Bu liste,
canlıya alıp her şeyi doğrulamak içindir. Ayrıntılı komutlar: [../DEPLOY.md](../DEPLOY.md).

> **Son doğrulama: 2026-07-20.** `[x]` işaretliler canlıdan HTTP ile doğrulandı.
> Tarayıcı/giriş gerektiren maddeler işaretlenmedi — onları elle geçmen gerek.

## 0. Önemli: migration durumu
Tüm şema migration'ları (0001–0007) **zaten paylaşımlı Neon DB'ye uygulandı**
(geliştirme sırasında). Sunucuda `drizzle-kit push`'a **gerek yok**. Yeni zorunlu
env **yok** (Stripe opsiyonel).

## 1. Deploy (sadece back değişti)
```bash
cd /var/www/digital-brain
git stash push bun.lockb   # sunucuda kirli kalıyor, pull'u abort ettiriyor
git pull

cd back
bun install            # SADECE yeni paket eklendiyse
bun run build
pm2 restart digital-brain
pm2 logs digital-brain --lines 30 --nostream   # hata var mı
```
> ⚠️ **`sudo -u mustafa` kullanma.** Sunucuya zaten `mustafa` olarak bağlanıyorsun
> ve sudoers'da değilsin ("mustafa is not in the sudoers file"). Düz `pm2` yeterli.
>
> ⚠️ **`git pull` sessizce abort edebilir** (`bun.lockb` yerel değişikliği yüzünden).
> Abort ederse `bun run build` **eski kodu** derler ve deploy olmuş gibi görünür.
> Pull çıktısında dosya listesi gördüğünden emin ol, sonra aşağıdan doğrula:
> ```bash
> curl -s https://xn--mustafakrpk-6zbc.com | grep -o "<title>[^<]*</title>"
> ```
> `.env.local`'da bunlar olmalı (önceki deploy'lardan): `DATABASE_URL`,
> `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DEFAULT_WORKSPACE_SLUG=mustafa`.

## 2. Smoke testleri (canlı — tarayıcıda)

### Public (giriş yok)
- [x] Kök domain `/` → HTTP 200, başlık `Stelvia — the collective knowledge universe`
- [x] `admin.*` → HTTP 200 — **ama artık kökle aynı sayfayı sunuyor**, ayrı landing değil
- [x] `/explore` → açılıyor, `Mustafa` galaksisi listede (⚠️ test hesapları da listede)
- [x] `/u/mustafa` → açılıyor, "Made with" rozeti **yok** (pro doğru çalışıyor)
- [ ] `/u/mustafa` → 28 node ve tema doğru mu (grafik client-side, gözle bak)
- [x] `/u/mustafa/opengraph-image` → HTTP 200, `image/png`, 328 KB
- [ ] ~~`mustafakırpık.com` (Vite kişisel site)~~ — **bayat madde.** Kök domain artık
      Next.js kolektif evreni sunuyor; `front/` orada servis edilmiyor. Vite sitesinin
      hâlâ bir yerde yayında olup olmadığı netleştirilmeli.

### Admin (giriş)
- [ ] `/admin/login` → kendi hesabınla giriş
- [ ] Dashboard → public link kartı + istatistikler
- [ ] Sol üst **workspace switcher** → adın görünür; "+ Yeni workspace" çalışır
- [ ] Nodes → liste; bir node ekle/düzenle/sil
- [ ] Import → bir `.md` yapıştır → node oluşur
- [ ] Analytics → (pro olduğun için) ziyaret sayacı + 14 günlük grafik
- [ ] Appearance → tema değiştir (örn. Plum) → `/u/mustafa`'da arka plan değişir
- [ ] Appearance → Explore'da listeleme toggle'ı çalışır (arayüz artık İngilizce)
- [ ] Team → kendini owner görürsün; bir e-posta davet et → "bekleyen" listesine düşer
- [ ] Billing → plan "PRO" görünür; özel domain kartı görünür
      (Stripe anahtarı yoksa "yapılandırılmadı" — normal)

## 3. Hızlı izolasyon kontrolü (opsiyonel ama önerilir)
- [ ] 2. bir e-posta ile **ücretsiz** hesap aç → kendi boş workspace'i gelir
- [ ] O hesapta `/admin/billing` → "FREE" + "Pro'ya geç"
- [ ] O hesabın `/u/<slug>`'ında **"Made with" rozeti** görünür
- [ ] İlk hesabının node'larını **göremez** (izolasyon)
- [ ] Test bitince o hesabı sil (Neon'dan `user` satırı → cascade)

## 4. Sonra (senin yapacakların — acil değil)
- [x] **Marka adı** → `Stelvia` (2026-07-20, canlıda doğrulandı). Cosmind bir müzik
      sitesinde kullanıldığı için değişti. Tek kaynak: `back/src/lib/brand.ts`.
- [ ] **`stelvia.com` domaini** → henüz alınmadı. Platform hâlâ Türkçe karakterli
      domainde; paylaşılan link `xn--mustafakrpk-6zbc.com`'a dönüşüyor (lansman riski).
- [ ] **Explore temizliği** → test hesapları (`ss`, `test`, `tolga`, `erntrgt`, `fahri`)
      `listed = true` olduğu için hem Explore'da hem kolektif evrende hem de
      `/admin/metrics`'teki "published" sayısında görünüyor.
- [ ] **Stripe** anahtarları → para canlı ([STRIPE-SETUP.md](STRIPE-SETUP.md))
- [ ] **Özel domain SSL** → domain başına Plesk ([CUSTOM-DOMAIN.md](CUSTOM-DOMAIN.md))
- [ ] **`CustomDomainCard`'daki CNAME hedefi** → kullanıcılara `admin.mustafakırpık.com`
      gösteriliyor; Türkçe karakterli host yurtdışı kullanıcıda DNS kurulumunu bozar.

## Bir şey patlarsa
- 502 → `pm2 logs digital-brain --lines 40 --nostream`
- Giriş olmuyor → `.env.local`'da `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` var mı
- Boş graph → `DEFAULT_WORKSPACE_SLUG=mustafa` var mı
