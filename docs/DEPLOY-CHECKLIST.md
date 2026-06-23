# Deploy + Smoke-Test Checklist

Faz 1–5 + landing/explore/temalar/analytics/takım/özel domain birikti. Bu liste,
canlıya alıp her şeyi doğrulamak içindir. Ayrıntılı komutlar: [../DEPLOY.md](../DEPLOY.md).

## 0. Önemli: migration durumu
Tüm şema migration'ları (0001–0007) **zaten paylaşımlı Neon DB'ye uygulandı**
(geliştirme sırasında). Sunucuda `drizzle-kit push`'a **gerek yok**. Yeni zorunlu
env **yok** (Stripe opsiyonel).

## 1. Deploy (sadece back değişti)
```bash
cd /var/www/digital-brain
git pull

cd back
bun install            # better-auth, stripe vb. yeni paketler
bun run build
sudo -u mustafa pm2 restart digital-brain
sudo -u mustafa pm2 logs digital-brain --lines 30 --nostream   # hata var mı
```
> `.env.local`'da bunlar olmalı (önceki deploy'lardan): `DATABASE_URL`,
> `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DEFAULT_WORKSPACE_SLUG=mustafa`.

## 2. Smoke testleri (canlı — tarayıcıda)

### Public (giriş yok)
- [ ] `admin.mustafakırpık.com/` → **landing** açılır (eskiden /admin'e atıyordu)
- [ ] Landing'de "Keşfet" linki → `/explore` açılır, senin galaksin listede
- [ ] `/u/mustafa` → graph açılır (28 node), tema doğru, rozet **yok** (pro)
- [ ] `mustafakırpık.com` (Vite kişisel site) → hâlâ çalışıyor (god_mode tümü)
- [ ] `admin.mustafakırpık.com/u/mustafa/opengraph-image` → galaksi kartı (png)

### Admin (giriş)
- [ ] `/admin/login` → kendi hesabınla giriş
- [ ] Dashboard → public link kartı + istatistikler
- [ ] Sol üst **workspace switcher** → adın görünür; "+ Yeni workspace" çalışır
- [ ] Nodes → liste; bir node ekle/düzenle/sil
- [ ] Import → bir `.md` yapıştır → node oluşur
- [ ] Analytics → (pro olduğun için) ziyaret sayacı + 14 günlük grafik
- [ ] Appearance → tema değiştir (örn. Plum) → `/u/mustafa`'da arka plan değişir
- [ ] Appearance → "Keşfet'te listele" toggle çalışır
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
- [ ] **Stripe** anahtarları → para canlı ([STRIPE-SETUP.md](STRIPE-SETUP.md))
- [ ] **Marka adı** → `back/src/lib/brand.ts` tek satır
- [ ] **Özel domain SSL** → domain başına Plesk ([CUSTOM-DOMAIN.md](CUSTOM-DOMAIN.md))

## Bir şey patlarsa
- 502 → `pm2 logs digital-brain --lines 40 --nostream`
- Giriş olmuyor → `.env.local`'da `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` var mı
- Boş graph → `DEFAULT_WORKSPACE_SLUG=mustafa` var mı
