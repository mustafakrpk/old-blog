"use server"

import { db } from "@/db"
import { nodes, links, type NewNode, type Node } from "@/db/schema"
import { eq, like, and, count, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { verifyAdminPassword, createSessionToken } from "@/lib/auth"

// ── Auth ─────────────────────────────────────────────────────────
export async function loginAction(password: string): Promise<boolean> {
	if (!verifyAdminPassword(password)) return false

	const token = createSessionToken()
	const cookieStore = await cookies()
	cookieStore.set("admin_session", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24, // 24h
		path: "/",
	})
	return true
}

export async function logoutAction() {
	const cookieStore = await cookies()
	cookieStore.delete("admin_session")
}

// ── Dashboard ────────────────────────────────────────────────────
export async function getDashboardStats() {
	const [nodeCount] = await db
		.select({ count: count() })
		.from(nodes)
	const [linkCount] = await db
		.select({ count: count() })
		.from(links)
	const byType = await db
		.select({ type: nodes.type, count: count() })
		.from(nodes)
		.groupBy(nodes.type)
	const byCluster = await db
		.select({ cluster: nodes.cluster, count: count() })
		.from(nodes)
		.groupBy(nodes.cluster)
	const byVisibility = await db
		.select({ visibility: nodes.visibility, count: count() })
		.from(nodes)
		.groupBy(nodes.visibility)

	return {
		nodeCount: nodeCount.count,
		linkCount: linkCount.count,
		byType,
		byCluster,
		byVisibility,
	}
}

// ── Node CRUD ────────────────────────────────────────────────────
export async function getNodesList(filters?: {
	type?: string
	cluster?: string
	search?: string
}) {
	let query = db.select().from(nodes).$dynamic()

	const conditions = []
	if (filters?.type) {
		conditions.push(eq(nodes.type, filters.type as Node["type"]))
	}
	if (filters?.cluster) {
		conditions.push(
			eq(nodes.cluster, filters.cluster as Node["cluster"]),
		)
	}
	if (filters?.search) {
		conditions.push(like(nodes.title, `%${filters.search}%`))
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions))
	}

	return query
}

export async function getNodeById(id: string) {
	const result = await db
		.select()
		.from(nodes)
		.where(eq(nodes.id, id))
		.limit(1)
	return result[0] ?? null
}

export async function getNodeLinks(nodeId: string) {
	const sourceLinks = await db
		.select()
		.from(links)
		.where(eq(links.source, nodeId))
	const targetLinks = await db
		.select()
		.from(links)
		.where(eq(links.target, nodeId))
	return { sourceLinks, targetLinks }
}

export async function createNode(data: NewNode) {
	await db.insert(nodes).values(data)
	revalidatePath("/")
	revalidatePath("/admin")
	revalidatePath("/admin/nodes")
}

export async function updateNode(
	id: string,
	data: Partial<NewNode>,
) {
	await db.update(nodes).set(data).where(eq(nodes.id, id))
	revalidatePath("/")
	revalidatePath("/admin")
	revalidatePath("/admin/nodes")
}

export async function deleteNode(id: string) {
	await db.delete(nodes).where(eq(nodes.id, id))
	revalidatePath("/")
	revalidatePath("/admin")
	revalidatePath("/admin/nodes")
}

export async function createLink(source: string, target: string) {
	await db
		.insert(links)
		.values({ source, target })
		.onConflictDoNothing()
	revalidatePath("/")
}

export async function deleteLink(source: string, target: string) {
	await db
		.delete(links)
		.where(and(eq(links.source, source), eq(links.target, target)))
	revalidatePath("/")
}
