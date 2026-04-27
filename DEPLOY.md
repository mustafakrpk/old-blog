# Deploy & Güncelleme Rehberi

Bu doküman projenin sunucudaki canlı kurulumunu ve gelecekte nasıl güncelleneceğini özetler.

---

## 🌐 Mimari

```
┌──────────────────────────────────────────────────────┐
│  https://mustafakırpık.com                           │
│  └─ front/ (Vite + React, static dosyalar)           │
│     Plesk → /var/www/vhosts/xn--mustafakrpk-6zbc.com │
│              /httpdocs/                              │
│                                                      │
│  https://admin.mustafakırpık.com                     │
│  └─ back/ (Next.js, PM2 ile port 3000)               │
│                                                      │
│  Veritabanı: Neon PostgreSQL (cloud, paylaşımlı)     │
└──────────────────────────────────────────────────────┘
```

- **Front** Vite ile build edilir, çıktısı (`front/dist/*`) Plesk'in `httpdocs` klasörüne kopyalanır → nginx static serve eder.
- **Back** Next.js olarak çalışır, PM2 process manager ile sürekli ayakta kalır, port 3000'de dinler.
- Plesk her iki domain için **nginx reverse proxy + Let's Encrypt SSL** sağlar.
- Front, API çağrılarını `admin.mustafakırpık.com/api/*` üzerinden yapar (CORS açık).

---

## 📁 Sunucudaki Yapı

```
/var/www/digital-brain/                  # git repo
├── front/                               # Vite app (kaynak)
│   ├── src/
│   ├── dist/                            # build çıktısı (gitignored)
│   └── .env.production                  # API URL (commit edilmiş)
├── back/                                # Next.js admin
│   ├── src/
│   ├── .next/                           # build çıktısı (gitignored)
│   └── .env.local                       # DB URL + admin şifre (gitignored!)
├── mobile/                              # mobil app (kullanılmıyor şu an)
└── ecosystem.config.cjs                 # PM2 config

/var/www/vhosts/xn--mustafakrpk-6zbc.com/
└── httpdocs/                            # nginx buradan front static'leri serve eder
    ├── index.html
    ├── assets/
    └── datasets/
```

---

## 🚀 İlk Kurulum (Yapıldı, referans için)

1. **Sistem hazırlığı** (Ubuntu 22.04 + Plesk Obsidian)
   - Node 20, Git, PM2, Nginx hazır geldi
   - Bun yüklendi: `curl -fsSL https://bun.sh/install | bash`

2. **Kod**
   ```bash
   git clone https://github.com/mustafakrpk/old-blog.git /var/www/digital-brain
   ```

3. **Back (admin)**
   ```bash
   cd /var/www/digital-brain/back
   # .env.local oluşturuldu (DATABASE_URL + ADMIN_PASSWORD)
   bun install
   bun run build
   pm2 start /var/www/digital-brain/ecosystem.config.cjs
   pm2 save && pm2 startup
   ```

4. **Front (arayüz)**
   ```bash
   cd /var/www/digital-brain/front
   bun install
   bun run build
   cp -r dist/* /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/
   ```

5. **Plesk ayarları**
   - `admin.mustafakırpık.com` subdomain oluşturuldu
   - SSL/Let's Encrypt her iki domain için alındı
   - Subdomain için "Additional nginx directives": `proxy_pass http://127.0.0.1:3000`
   - Ana domain default static serve (Apache + nginx)

---

## 🔄 Güncelleme Akışı

### Senaryo A — Sadece front değişti (UI, sayfa, stil)

**Local:**
```bash
cd front
# kodda değişiklik yap, test et: bun dev → localhost:5173
git add -A
git commit -m "front: X eklendi"
git push
```

**Sunucu:**
```bash
cd /var/www/digital-brain
git pull

cd front
bun install      # sadece yeni paket eklendiyse
bun run build

# httpdocs'a kopyala
rm -rf /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/*
cp -r dist/* /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/

# Permission'ları düzelt
chown mustafa:psaserv /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/
chown -R mustafa:psacln /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/*
find /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/ -type d -exec chmod 750 {} \;
find /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/ -type f -exec chmod 644 {} \;
```

Tarayıcıda hard refresh (Ctrl+Shift+R) — yeni asset hash'lerini görsün.

---

### Senaryo B — Sadece back değişti (admin, API, server action, DB)

**Local:**
```bash
cd back
# kodda değişiklik yap, test et: bun dev → localhost:3000
git add -A
git commit -m "admin: X düzeltildi"
git push
```

**Sunucu:**
```bash
cd /var/www/digital-brain
git pull

cd back
bun install      # sadece yeni paket eklendiyse
bun run build

pm2 restart digital-brain
pm2 logs digital-brain --lines 30 --nostream   # hata var mı kontrol
```

> **DB schema değiştiyse** (yeni tablo, kolon vb): önce migration çalıştır:
> ```bash
> cd back
> bunx drizzle-kit push   # veya migrate
> ```

---

### Senaryo C — Hem front hem back değişti

Önce **back**, sonra **front** sırasıyla yukarıdaki adımları uygula. Veya tek komutla:

---

## ⚡ Tek Komutla Deploy (önerilen)

`/var/www/digital-brain/deploy.sh` dosyası oluştur:

```bash
#!/bin/bash
set -e

echo "→ Pull..."
cd /var/www/digital-brain
git pull

echo "→ Back build..."
cd back
bun install
bun run build
pm2 restart digital-brain

echo "→ Front build..."
cd ../front
bun install
bun run build

echo "→ Deploy front to httpdocs..."
HTTPDOCS=/var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs
rm -rf $HTTPDOCS/*
cp -r dist/* $HTTPDOCS/
chown mustafa:psaserv $HTTPDOCS
chown -R mustafa:psacln $HTTPDOCS/*
find $HTTPDOCS -type d -exec chmod 750 {} \;
find $HTTPDOCS -type f -exec chmod 644 {} \;

echo "✓ Deploy tamamlandı"
echo
pm2 list
```

Çalıştırılabilir yap:
```bash
chmod +x /var/www/digital-brain/deploy.sh
```

Artık tek komut:
```bash
/var/www/digital-brain/deploy.sh
```

---

## 🛠 Sık Kullanılan Komutlar

### PM2
```bash
pm2 list                          # çalışan uygulamalar
pm2 logs digital-brain            # canlı log
pm2 logs digital-brain --lines 50 --nostream   # son 50 satır
pm2 restart digital-brain         # yeniden başlat
pm2 stop digital-brain            # durdur
pm2 start digital-brain           # başlat
pm2 monit                         # dashboard (CPU, RAM)
pm2 save                          # mevcut listeyi kaydet
```

### Sunucu durumu
```bash
df -h /                           # disk
free -h                           # RAM
uptime                            # yük + uptime
ss -tlnp | grep :3000             # port 3000'i kim dinliyor
```

### Test
```bash
curl -I https://mustafakırpık.com           # front canlı mı (200 dönmeli)
curl -I https://admin.mustafakırpık.com     # back canlı mı (307 dönmeli)
curl -I http://localhost:3000               # back direkt (PM2)
```

---

## 🩹 Yaygın Sorunlar

### `502 Bad Gateway`
PM2 / Next.js çökmüş.
```bash
pm2 list                                         # status'a bak
pm2 logs digital-brain --lines 30 --nostream    # hatayı oku
pm2 restart digital-brain
```

Port 3000 başkası tarafından tutuluyorsa:
```bash
fuser -k 3000/tcp
pm2 restart digital-brain
```

### Front'ta değişiklik gözükmüyor
Browser cache. Hard refresh: **Ctrl+Shift+R** (Mac: Cmd+Shift+R).
Hâlâ yoksa httpdocs içinde son build'in olduğunu doğrula:
```bash
ls -la /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/assets/
```

### Admin'e giriş yapılamıyor
`back/.env.local`'deki `ADMIN_PASSWORD`'u kontrol et. Şifreyi unuttuysan dosyada yazılı.

### CORS hatası (browser console'da)
`back/src/app/api/graph/route.ts` içinde `Access-Control-Allow-Origin: *` header'ı olmalı. Pull alındıysa sorun olmaz.

### Build hatası: `next: command not found`
`node_modules` eksik:
```bash
cd /var/www/digital-brain/back  # veya front
rm -rf node_modules
bun install
bun run build
```

---

## 🔐 Güvenlik Hatırlatmaları

- [ ] `back/.env.local` git'e gitmemeli (gitignored, doğrula)
- [ ] `ADMIN_PASSWORD` güçlü olmalı (en az 16 karakter, random)
- [ ] Plesk panel şifresi güçlü olmalı
- [ ] Firewall: sadece port 22 (SSH), 80 (HTTP), 443 (HTTPS), 8443 (Plesk) açık
- [ ] Server'ı düzenli güncelle: `apt update && apt upgrade -y`

---

## 💾 Backup

- **DB:** Neon otomatik PITR (point-in-time recovery) yapıyor — son 7 gün geri alınabilir.
  - Manuel snapshot: [console.neon.tech](https://console.neon.tech) → Branches → "Create branch from current state"
- **Kod:** GitHub'da, push edilmiş her şey güvende
- **Server config:** Plesk → Tools & Settings → Backup Manager

---

## 📞 Sürüm bilgileri

| Bileşen | Sürüm |
|---|---|
| Ubuntu | 22.04 |
| Plesk | Obsidian 18.0.77 |
| Node | 20.20.2 |
| Bun | 1.x |
| PM2 | 6.0.14 |
| Nginx | 1.28.3 |
| Next.js (back) | 16.1.6 |
| Vite (front) | 5.3.1 |

---

## 🌐 URL'ler

- **Canlı arayüz:** https://mustafakırpık.com
- **Admin paneli:** https://admin.mustafakırpık.com
- **GitHub repo:** https://github.com/mustafakrpk/old-blog
- **DB konsolu:** https://console.neon.tech
- **Plesk panel:** https://178.251.238.123:8443
