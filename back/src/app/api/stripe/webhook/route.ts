import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { workspaces } from "@/db/schema"
import { getStripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

async function setPlanForSubscription(sub: Stripe.Subscription, plan: string) {
	const wsId = sub.metadata?.workspaceId
	const values = { plan, stripeSubscriptionId: sub.id }
	if (wsId) {
		await db.update(workspaces).set(values).where(eq(workspaces.id, wsId))
	} else {
		const customerId =
			typeof sub.customer === "string" ? sub.customer : sub.customer.id
		await db
			.update(workspaces)
			.set(values)
			.where(eq(workspaces.stripeCustomerId, customerId))
	}
}

export async function POST(request: NextRequest) {
	const stripe = getStripe()
	const secret = process.env.STRIPE_WEBHOOK_SECRET
	if (!stripe || !secret) {
		return NextResponse.json({ error: "billing disabled" }, { status: 503 })
	}

	const sig = request.headers.get("stripe-signature")
	const body = await request.text()

	let event: Stripe.Event
	try {
		event = stripe.webhooks.constructEvent(body, sig!, secret)
	} catch {
		return NextResponse.json({ error: "invalid signature" }, { status: 400 })
	}

	switch (event.type) {
		case "checkout.session.completed": {
			const s = event.data.object
			const wsId = s.metadata?.workspaceId
			if (wsId) {
				await db
					.update(workspaces)
					.set({
						plan: "pro",
						stripeSubscriptionId:
							typeof s.subscription === "string" ? s.subscription : null,
					})
					.where(eq(workspaces.id, wsId))
			}
			break
		}
		case "customer.subscription.created":
		case "customer.subscription.updated": {
			const sub = event.data.object
			const active = ["active", "trialing"].includes(sub.status)
			await setPlanForSubscription(sub, active ? "pro" : "free")
			break
		}
		case "customer.subscription.deleted": {
			await setPlanForSubscription(event.data.object, "free")
			break
		}
	}

	return NextResponse.json({ received: true })
}
