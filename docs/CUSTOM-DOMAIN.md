# Özel Domain (Pro) — Kurulum

Uygulama katmanı hazır: Pro kullanıcı `/admin/billing`'de domainini girer; server
o Host'a gelen isteği ilgili workspace'in graph'ına yönlendirir
(`app/page.tsx` → `getWorkspaceByDomain`). Geriye **DNS + SSL** (ops) kalıyor.

## Kullanıcının yapacağı (DNS)
Domain sağlayıcısında bir kayıt ekler:
```
CNAME   notlar.site.com   →   admin.mustafakırpık.com
```
(Apex/kök domain CNAME kabul etmiyorsa A kaydı ile sunucu IP'sine: `178.251.238.123`.)

## Site yöneticisinin yapacağı (SSL — Plesk)
Her özel domain için bir kez:
1. Plesk → ilgili site → **Hosting & DNS → Domain alias ekle** (veya yeni domain)
   ve `admin.mustafakırpık.com`'a giden Next.js (port 3000) servisine yönlendir.
2. **SSL/TLS → Let's Encrypt** ile o domain için sertifika al.
3. nginx reverse proxy: `proxy_pass http://127.0.0.1:3000;` (mevcut back ile aynı).

> Not: Bu adım şu an manuel (düşük ölçek için yeterli). Self-serve otomatik SSL
> gerekince Caddy "on-demand TLS" veya bir reverse-proxy katmanı değerlendirilebilir
> — o zaman kullanıcı domaini girince sertifika otomatik üretilir.

## Doğrulama
Domain bağlandıktan sonra `https://notlar.site.com` doğrudan kullanıcının
galaksisini gösterir (rozet yok — Pro). Uygulama tarafı için ek bir şey gerekmez.
