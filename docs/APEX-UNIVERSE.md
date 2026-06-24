# Apex'i "Evren"e Taşıma (mustafakırpık.com → Next)

Kod hazır: Next app'in kökü (`/`) artık **kolektif evren** galaksisini gösteriyor
(özel domain'e bağlı host'lar hariç — onlar kendi graph'ını gösterir).
Geriye **apex domain'i Vite static yerine Next'e yönlendirmek** (ops) kalıyor.

## Mevcut durum
- `mustafakırpık.com` (apex) → Plesk `httpdocs` (Vite static, kişisel graph)
- `admin.mustafakırpık.com` → Next (PM2 :3000)

## Hedef
- `mustafakırpık.com` (apex) → **Next (:3000)** → kolektif **evren**
- Senin kişisel grafiğin zaten `admin.…/u/mustafa`'da (kaybolmaz)

## Plesk adımları (apex domain)
1. Plesk → `mustafakırpık.com` → **Apache & nginx Settings**.
2. **Additional nginx directives** alanına (admin subdomain'deki gibi) reverse proxy:
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```
   (Gerekirse "Proxy mode" / static serving'i kapat.)
3. SSL (Let's Encrypt) apex için zaten var — dokunma.
4. Kaydet → test: `https://mustafakırpık.com` → **evren** açılmalı.

## Doğrulama
- [ ] `mustafakırpık.com` → kolektif evren (3D, renkli kümeler)
- [ ] Bir düğüme tıkla → ilgili `/u/<slug>`'a gider
- [ ] `mustafakırpık.com/welcome` → tanıtım sayfası
- [ ] `mustafakırpık.com/u/mustafa` → senin galaksin (kişisel)
- [ ] `admin.mustafakırpık.com/admin` → panel (değişmedi)

## Vite front (opsiyonel temizlik)
Apex Next'e geçince `front/` (Vite) ve `httpdocs` içeriği **artık kullanılmıyor**.
İstersen sonra `front/` klasörünü ve httpdocs static'lerini kaldırırız. Acelesi yok;
çalıştığını gördükten sonra.

> Not: Next, Host başlığına bakar. Apex host hiçbir `customDomain` ile eşleşmediği
> için otomatik **evren** render edilir. Ekstra env/kod gerekmez.
