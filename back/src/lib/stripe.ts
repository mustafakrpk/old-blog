import Stripe from "stripe"

// Stripe anahtarı yoksa null döner — billing kapalı, app çalışmaya devam eder.
let _stripe: Stripe | null = null

export function getStripe(): Stripe | null {
	if (_stripe) return _stripe
	const key = process.env.STRIPE_SECRET_KEY
	if (!key) return null
	_stripe = new Stripe(key)
	return _stripe
}

export function isBillingEnabled(): boolean {
	return Boolean(
		process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID,
	)
}
