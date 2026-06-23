# Stripe Kurulumu (Faz 4 — Para)

Kod hazır ve Stripe anahtarları **olmadan da çalışıyor** (billing kapalı, app
sorunsuz). Ödemeyi açmak için stripe.com'da hesap açıp aşağıdaki adımları izle.

## 1. Stripe hesabı + ürün
1. [stripe.com](https://stripe.com) → hesap aç. Başta **Test mode** (sağ üstte toggle).
2. **Products** → *Add product*:
   - Ad: `Pro`
   - Fiyat: **$9 / month**, recurring
   - Kaydet → oluşan **Price ID**'yi kopyala (`price_...`)

## 2. API anahtarları
**Developers → API keys**:
- **Secret key** (`sk_test_...` test, `sk_live_...` canlı)

## 3. Webhook
**Developers → Webhooks → Add endpoint**:
- URL: `https://admin.mustafakırpık.com/api/stripe/webhook`
- Dinlenecek event'ler:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Kaydet → **Signing secret**'i kopyala (`whsec_...`)

## 4. Env değişkenleri (`back/.env.local` ve sunucuda)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
> `isBillingEnabled()` yalnızca `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` varsa
> true döner; o zaman "Pro'ya geç" butonu aktifleşir.

## 5. Lokal test (Stripe CLI)
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# çıkan whsec_... değerini .env.local'a koy
```
Test kartı: `4242 4242 4242 4242`, ileri tarih, herhangi CVC.

## 6. Akış (nasıl çalışıyor)
- `/admin/billing` → **Pro'ya geç** → `createCheckoutSession()` → Stripe Checkout
- Ödeme sonrası webhook → `workspaces.plan = "pro"` + `stripe_subscription_id`
- Pro avantajı (ilk günden çalışan): public viewer'da **"Made with" rozeti kalkar**
- Free node limiti: **100** (Pro = sınırsız) — `lib/plan.ts`
- **Aboneliği yönet** → `createPortalSession()` → Stripe Customer Portal (iptal/kart)

## 7. Canlıya geçiş
Test akışı çalışınca: Stripe'ı **Live mode**'a al, `sk_live_...` + canlı `price_...`
+ canlı webhook `whsec_...` ile env'leri güncelle, restart.
