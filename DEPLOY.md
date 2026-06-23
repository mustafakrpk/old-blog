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
- **PM2 `mustafa` user altında çalışır** (root değil). Bun `/usr/local/bin/bun`'da system-wide.
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
│   └── .env.local                       # DB URL + Better-Auth secret (gitignored!)
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
   # .env.local oluşturuldu (DATABASE_URL + BETTER_AUTH_SECRET + BETTER_AUTH_URL)
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
# ÖNEMLİ: Plesk'te klasörler psaserv group'unda, dosyalar psacln'de olmalı
find /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/ -type d -exec chown mustafa:psaserv {} \;
find /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/ -type f -exec chown mustafa:psacln {} \;
find /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/ -type d -exec chmod 750 {} \;
find /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/ -type f -exec chmod 644 {} \;
```

Tarayıcıda hard refresh (Ctrl+Shift+R) — yeni asset hash'lerini görsün.

---

### ⚠️ BİR KERELİK — Better-Auth geçişi (auth: ADMIN_PASSWORD → Better-Auth)

`5f9e678` commit'i admin auth'unu **ADMIN_PASSWORD** yerine **Better-Auth**
(email + şifre) ile değiştirdi. Bu commit'i içeren ilk pull'da sunucuda ek olarak
**şu adımları bir kez** yapman gerekir, yoksa admin'e giriş çalışmaz:

```bash
cd /var/www/digital-brain/back

# 1) .env.local'a iki satır ekle:
cat >> .env.local <<'EOF'
BETTER_AUTH_SECRET=G3EMENILQrSvwQ7UaBXdEms4yqu5mOrbjqofd48kEJs=
BETTER_AUTH_URL=https://admin.mustafakırpık.com
EOF

# 2) Auth tablolarını oluştur (zaten oluşturulduysa zararsız — IF NOT EXISTS):
bunx drizzle-kit push        # user/session/account/verification

# 3) better-auth paketi için install + build + restart (Senaryo B'deki gibi)
bun install && bun run build
sudo -u mustafa pm2 restart digital-brain
```

> İlk girişte `https://admin.mustafakırpık.com/admin/login` → **"Sign up"** ile
> kendi hesabını oluştur. Eski `ADMIN_PASSWORD` artık kullanılmıyor (silinmedi,
> sadece etkisiz). **Henüz multi-tenant izolasyon yok** — giriş yapan herkes aynı
> tek graph'ı yönetir (Faz 1 Adım 2'de `workspace_id` ile izole edilecek).

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

sudo -u mustafa pm2 restart digital-brain
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
sudo -u mustafa bun install
sudo -u mustafa bun run build
sudo -u mustafa pm2 restart digital-brain

echo "→ Front build..."
cd ../front
bun install
bun run build

echo "→ Deploy front to httpdocs..."
HTTPDOCS=/var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs
rm -rf $HTTPDOCS/*
cp -r dist/* $HTTPDOCS/
# Klasörler psaserv group, dosyalar psacln group (Plesk standardı)
find $HTTPDOCS -type d -exec chown mustafa:psaserv {} \;
find $HTTPDOCS -type f -exec chown mustafa:psacln {} \;
find $HTTPDOCS -type d -exec chmod 750 {} \;
find $HTTPDOCS -type f -exec chmod 644 {} \;

echo "✓ Deploy tamamlandı"
echo
sudo -u mustafa pm2 list
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

### PM2 (mustafa user altında çalışıyor — `sudo -u mustafa` prefix'i ZORUNLU)
```bash
sudo -u mustafa pm2 list                                    # çalışan uygulamalar
sudo -u mustafa pm2 logs digital-brain                      # canlı log
sudo -u mustafa pm2 logs digital-brain --lines 50 --nostream # son 50 satır
sudo -u mustafa pm2 restart digital-brain                   # yeniden başlat
sudo -u mustafa pm2 stop digital-brain                      # durdur
sudo -u mustafa pm2 start digital-brain                     # başlat
sudo -u mustafa pm2 monit                                   # dashboard (CPU, RAM)
sudo -u mustafa pm2 save                                    # mevcut listeyi kaydet
```

> **Not:** PM2 daemon başlangıçta birkaç `spawn /usr/bin/node EACCES` warning'i basabilir. Bu zararsız — PM2'nin internal IPC denemeleri, app yine de çalışır.

### Systemd
```bash
systemctl status pm2-mustafa     # auto-start servisi durumu
systemctl restart pm2-mustafa    # gerekirse manuel restart
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
sudo -u mustafa pm2 list                                       # status'a bak
sudo -u mustafa pm2 logs digital-brain --lines 30 --nostream   # hatayı oku
sudo -u mustafa pm2 restart digital-brain
```

Port 3000 başkası tarafından tutuluyorsa:
```bash
fuser -k 3000/tcp
sudo -u mustafa pm2 restart digital-brain
```

### `Authentication failure` veya `Script not found: /root/.bun/bin/bun`
Plesk mustafa user'ının shell'ini reset etmiş veya bun path bozulmuş olabilir.
```bash
# Shell'i tekrar aç
getent passwd mustafa   # /bin/bash mi? Yoksa /bin/false mi?
usermod -s /bin/bash mustafa

# Bun system-wide mi?
ls -la /usr/local/bin/bun
# Yoksa kopyala:
cp /root/.bun/bin/bun /usr/local/bin/bun && chmod 755 /usr/local/bin/bun

# Ecosystem path'i doğru mu?
grep "script:" /var/www/digital-brain/ecosystem.config.cjs
# `/usr/local/bin/bun` olmalı, `/root/.bun/...` değil
```

### Front'ta değişiklik gözükmüyor
Browser cache. Hard refresh: **Ctrl+Shift+R** (Mac: Cmd+Shift+R).
Hâlâ yoksa httpdocs içinde son build'in olduğunu doğrula:
```bash
ls -la /var/www/vhosts/xn--mustafakrpk-6zbc.com/httpdocs/assets/
```

### Admin'e giriş yapılamıyor (Better-Auth)
1. `back/.env.local`'de **`BETTER_AUTH_SECRET`** ve **`BETTER_AUTH_URL`** var mı?
   (`BETTER_AUTH_URL` canlıda `https://admin.mustafakırpık.com` olmalı.)
2. Auth tabloları DB'de var mı? `bunx drizzle-kit push` ile oluştur.
3. Hesabın yoksa `/admin/login` → **"Sign up"** ile oluştur.
4. Şifreyi unuttuysan: Neon'da `user`/`account` satırını silip yeniden sign up yap
   (henüz "şifre sıfırlama" e-postası kurulmadı).

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
- [ ] `BETTER_AUTH_SECRET` gizli kalmalı (sızarsa tüm session'lar taklit edilebilir; sızdıysa yenisini üret + restart)
- [ ] Eski `ADMIN_PASSWORD` artık kullanılmıyor — `.env.local`'dan silebilirsin
- [ ] Plesk panel şifresi güçlü olmalı
- [ ] Firewall: sadece port 22 (SSH), 80 (HTTP), 443 (HTTPS), 8443 (Plesk) açık
- [ ] Server'ı düzenli güncelle: `apt update && apt upgrade -y`
- [x] App root yerine `mustafa` user altında çalışır (zaten yapıldı)

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
