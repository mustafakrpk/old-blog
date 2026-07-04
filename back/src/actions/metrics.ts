"use server"

import { headers } from "next/headers"
import { randomUUID } from "crypto"
import { count, gte, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { user, workspaces, nodes, follows, pageViews, events } from "@/db/schema"
import { auth } from "@/lib/auth"

const KNOWN_EVENTS = new Set(["pro_click"])
const DAY = 24 * 60 * 60 * 1000

/** Hafif olay kaydı (ör. "Go Pro" tıklaması). Whitelist'li. */
export async function trackEvent(type: string) {
	if (!KNOWN_EVENTS.has(type)) return
	await db.insert(events).values({ id: randomUUID(), type })
}

async function assertFounder() {
	const session = await auth.api.getSession({ headers: await headers() })
	const founder = process.env.FOUNDER_EMAIL
	if (!founder) throw new Error("NO_FOUNDER_EMAIL")
	if (!session || session.user.email !== founder) throw new Error("FORBIDDEN")
}

/** Platform geneli kurucu metrikleri. Yalnızca FOUNDER_EMAIL sahibine. */
export async function getFounderMetrics() {
	await assertFounder()

	const [users] = await db.select({ c: count() }).from(user)
	const [wss] = await db.select({ c: count() }).from(workspaces)
	const [nds] = await db.select({ c: count() }).from(nodes)
	const [fls] = await db.select({ c: count() }).from(follows)
	const [views] = await db.select({ c: count() }).from(pageViews)
	const [proClicks] = await db
		.select({ c: count() })
		.from(events)
		.where(eq(events.type, "pro_click"))

	const since7 = new Date(Date.now() - 7 * DAY)
	const [new7] = await db
		.select({ c: count() })
		.from(user)
		.where(gte(user.createdAt, since7))

	// Node sayıları / workspace
	const nodeCounts = await db
		.select({ wid: nodes.workspaceId, c: count() })
		.from(nodes)
		.groupBy(nodes.workspaceId)
	const nodeMap = new Map(nodeCounts.map((r) => [r.wid, r.c]))

	const wsRows = await db
		.select({ id: workspaces.id, listed: workspaces.listed })
		.from(workspaces)
	let published = 0
	let activated = 0
	for (const w of wsRows) {
		const n = nodeMap.get(w.id) ?? 0
		if (n >= 5) activated++
		if (w.listed && n > 0) published++
	}

	// Son kayıtlar
	const recent = await db
		.select({
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
		})
		.from(user)
		.orderBy(desc(user.createdAt))
		.limit(12)

	// Son 14 gün kayıt (günlük)
	const since14 = new Date(Date.now() - 13 * DAY)
	since14.setHours(0, 0, 0, 0)
	const signupRows = await db
		.select({ createdAt: user.createdAt })
		.from(user)
		.where(gte(user.createdAt, since14))
	const buckets = new Map<string, number>()
	for (let i = 0; i < 14; i++) {
		buckets.set(
			new Date(since14.getTime() + i * DAY).toISOString().slice(0, 10),
			0,
		)
	}
	for (const r of signupRows) {
		const k = new Date(r.createdAt).toISOString().slice(0, 10)
		if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1)
	}
	const signups = [...buckets.entries()].map(([date, c]) => ({ date, count: c }))

	return {
		totalUsers: users.c,
		totalWorkspaces: wss.c,
		totalNodes: nds.c,
		totalFollows: fls.c,
		totalViews: views.c,
		proClicks: proClicks.c,
		newUsers7d: new7.c,
		published,
		activated,
		recent,
		signups,
	}
}
