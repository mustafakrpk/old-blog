"use server"

import { eq } from "drizzle-orm"
import { db } from "@/db"
import { workspaces } from "@/db/schema"
import { requireWorkspace } from "@/lib/tenant"
import { getStripe, isBillingEnabled } from "@/lib/stripe"

function baseUrl(): string {
	return process.env.BETTER_AUTH_URL || "http://localhost:3000"
}

/** Free → Pro yükseltme için Stripe Checkout oturumu açar, URL döner. */
export async function createCheckoutSession(): Promise<string> {
	if (!isBillingEnabled()) throw new Error("BILLING_DISABLED")
	const stripe = getStripe()!
	const ws = await requireWorkspace()

	// Müşteri yoksa oluştur, workspace'e bağla.
	let customerId = ws.stripeCustomerId
	if (!customerId) {
		const customer = await stripe.customers.create({
			metadata: { workspaceId: ws.id, slug: ws.slug },
		})
		customerId = customer.id
		await db
			.update(workspaces)
			.set({ stripeCustomerId: customerId })
			.where(eq(workspaces.id, ws.id))
	}

	const session = await stripe.checkout.sessions.create({
		mode: "subscription",
		customer: customerId,
		line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
		success_url: `${baseUrl()}/admin/billing?success=1`,
		cancel_url: `${baseUrl()}/admin/billing`,
		metadata: { workspaceId: ws.id },
		subscription_data: { metadata: { workspaceId: ws.id } },
	})

	if (!session.url) throw new Error("NO_CHECKOUT_URL")
	return session.url
}

/** Pro kullanıcı için abonelik yönetim portalı (iptal/güncelleme). */
export async function createPortalSession(): Promise<string> {
	if (!isBillingEnabled()) throw new Error("BILLING_DISABLED")
	const stripe = getStripe()!
	const ws = await requireWorkspace()
	if (!ws.stripeCustomerId) throw new Error("NO_CUSTOMER")

	const session = await stripe.billingPortal.sessions.create({
		customer: ws.stripeCustomerId,
		return_url: `${baseUrl()}/admin/billing`,
	})
	return session.url
}
