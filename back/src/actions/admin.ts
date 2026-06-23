"use server"

import { db } from "@/db"
import {
	nodes,
	links,
	pageViews,
	workspaces,
	nodeTypeEnum,
	clusterEnum,
	visibilityEnum,
	type NewNode,
	type Node,
} from "@/db/schema"
import { eq, like, and, count, asc, ne, gte } from "drizzle-orm"
import { isPaid } from "@/lib/plan"
import { getTheme } from "@/lib/themes"
import { revalidatePath } from "next/cache"
import { requireWorkspace } from "@/lib/tenant"
import { getTemplate } from "@/lib/templates"
import { parseMarkdownFiles, type InputFile } from "@/lib/import-markdown"
import { nodeLimit } from "@/lib/plan"
import type { Workspace } from "@/db/schema"

// Free plan node limiti kontrolü — aşılırsa NODE_LIMIT fırlatır.
async function assertNodeCapacity(ws: Workspace, adding: number) {
	const limit = nodeLimit(ws.plan)
	if (limit === Infinity) return
	const [c] = await db
		.select({ count: count() })
		.from(nodes)
		.where(eq(nodes.workspaceId, ws.id))
	if (c.count + adding > limit) throw new Error("NODE_LIMIT")
}

// Auth Better-Auth ile (lib/auth.ts). Her fonksiyon requireWorkspace() ile
// giriş yapan kullanıcının workspace'ine kilitlenir — izolasyonun tek kapısı.

// İçeriği değişen herkese açık sayfayı ve admin'i tazele.
function revalidateGraph() {
	revalidatePath("/")
	revalidatePath("/admin")
	revalidatePath("/admin/nodes")
}

// ── Workspace ────────────────────────────────────────────────────
export async function getMyWorkspace() {
	const ws = await requireWorkspace()
	const [nodeCount] = await db
		.select({ count: count() })
		.from(nodes)
		.where(eq(nodes.workspaceId, ws.id))
	return {
		slug: ws.slug,
		name: ws.name,
		plan: ws.plan,
		theme: ws.theme,
		defaultMode: ws.defaultMode,
		nodeCount: nodeCount.count,
	}
}

// Graph temasını değiştirir. Premium temalar (free olmayan) yalnızca Pro'da.
export async function setTheme(key: string) {
	const ws = await requireWorkspace()
	const theme = getTheme(key)
	if (!theme.free && !isPaid(ws.plan)) throw new Error("NOT_PRO")
	await db
		.update(workspaces)
		.set({ theme: theme.key })
		.where(eq(workspaces.id, ws.id))
	revalidateGraph()
	return theme.key
}

// Boş bir workspace'e hazır şablon yükler (onboarding).
export async function applyTemplate(key: string) {
	const ws = await requireWorkspace()
	const tpl = getTemplate(key)
	if (!tpl) throw new Error("UNKNOWN_TEMPLATE")
	await assertNodeCapacity(ws, tpl.nodes.length)

	await db
		.insert(nodes)
		.values(tpl.nodes.map((node) => ({ ...node, workspaceId: ws.id })))
		.onConflictDoNothing()

	if (tpl.links.length > 0) {
		await db
			.insert(links)
			.values(tpl.links.map((l) => ({ ...l, workspaceId: ws.id })))
			.onConflictDoNothing()
	}

	revalidateGraph()
}

// Markdown/Obsidian dosyalarını içe aktarır.
// Var olmayan node'a giden [[link]]'ler (FK güvenliği için) atlanır.
export async function importMarkdown(files: InputFile[]) {
	const ws = await requireWorkspace()
	const parsed = parseMarkdownFiles(files)
	if (parsed.nodes.length === 0) return { nodes: 0, links: 0, skippedLinks: 0 }
	await assertNodeCapacity(ws, parsed.nodes.length)

	await db
		.insert(nodes)
		.values(parsed.nodes.map((node) => ({ ...node, workspaceId: ws.id })))
		.onConflictDoNothing()

	// Workspace'teki tüm node id'leri — link hedefi var mı diye kontrol için.
	const existing = await db
		.select({ id: nodes.id })
		.from(nodes)
		.where(eq(nodes.workspaceId, ws.id))
	const ids = new Set(existing.map((r) => r.id))

	const validLinks = parsed.links.filter(
		(l) => ids.has(l.source) && ids.has(l.target),
	)
	const skippedLinks = parsed.links.length - validLinks.length

	if (validLinks.length > 0) {
		await db
			.insert(links)
			.values(validLinks.map((l) => ({ ...l, workspaceId: ws.id })))
			.onConflictDoNothing()
	}

	revalidateGraph()
	return {
		nodes: parsed.nodes.length,
		links: validLinks.length,
		skippedLinks,
	}
}

// ── Analytics (Pro) ──────────────────────────────────────────────
const DAY_MS = 24 * 60 * 60 * 1000

export async function getAnalytics() {
	const ws = await requireWorkspace()
	if (!isPaid(ws.plan)) {
		return { locked: true as const, plan: ws.plan }
	}

	const since = new Date(Date.now() - 13 * DAY_MS)
	since.setHours(0, 0, 0, 0)

	const [total] = await db
		.select({ count: count() })
		.from(pageViews)
		.where(eq(pageViews.workspaceId, ws.id))

	const rows = await db
		.select({ createdAt: pageViews.createdAt })
		.from(pageViews)
		.where(
			and(eq(pageViews.workspaceId, ws.id), gte(pageViews.createdAt, since)),
		)

	// Son 14 günü güne göre kovala (boş günler 0).
	const buckets = new Map<string, number>()
	for (let i = 0; i < 14; i++) {
		const d = new Date(since.getTime() + i * DAY_MS)
		buckets.set(d.toISOString().slice(0, 10), 0)
	}
	for (const r of rows) {
		const key = new Date(r.createdAt).toISOString().slice(0, 10)
		if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
	}

	const days = [...buckets.entries()].map(([date, count]) => ({ date, count }))
	const last7 = days.slice(-7).reduce((s, d) => s + d.count, 0)

	return { locked: false as const, plan: ws.plan, total: total.count, last7, days }
}

// ── Dashboard ────────────────────────────────────────────────────
export async function getDashboardStats() {
	const ws = await requireWorkspace()
	const wsNodes = eq(nodes.workspaceId, ws.id)

	const [nodeCount] = await db
		.select({ count: count() })
		.from(nodes)
		.where(wsNodes)
	const [linkCount] = await db
		.select({ count: count() })
		.from(links)
		.where(eq(links.workspaceId, ws.id))
	const byTypeRaw = await db
		.select({ type: nodes.type, count: count() })
		.from(nodes)
		.where(wsNodes)
		.groupBy(nodes.type)
	const byClusterRaw = await db
		.select({ cluster: nodes.cluster, count: count() })
		.from(nodes)
		.where(wsNodes)
		.groupBy(nodes.cluster)
	const byVisibilityRaw = await db
		.select({ visibility: nodes.visibility, count: count() })
		.from(nodes)
		.where(wsNodes)
		.groupBy(nodes.visibility)

	const byType = nodeTypeEnum.enumValues.map((type) => ({
		type,
		count: byTypeRaw.find((r) => r.type === type)?.count ?? 0,
	}))
	const byCluster = clusterEnum.enumValues.map((cluster) => ({
		cluster,
		count: byClusterRaw.find((r) => r.cluster === cluster)?.count ?? 0,
	}))
	const byVisibility = visibilityEnum.enumValues.map((visibility) => ({
		visibility,
		count: byVisibilityRaw.find((r) => r.visibility === visibility)?.count ?? 0,
	}))

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
	const ws = await requireWorkspace()

	const conditions = [eq(nodes.workspaceId, ws.id)]
	if (filters?.type) {
		conditions.push(eq(nodes.type, filters.type as Node["type"]))
	}
	if (filters?.cluster) {
		conditions.push(eq(nodes.cluster, filters.cluster as Node["cluster"]))
	}
	if (filters?.search) {
		conditions.push(like(nodes.title, `%${filters.search}%`))
	}

	return db
		.select()
		.from(nodes)
		.where(and(...conditions))
}

export async function getNodeById(id: string) {
	const ws = await requireWorkspace()
	const result = await db
		.select()
		.from(nodes)
		.where(and(eq(nodes.workspaceId, ws.id), eq(nodes.id, id)))
		.limit(1)
	return result[0] ?? null
}

export async function getNodeLinks(nodeId: string) {
	const ws = await requireWorkspace()

	// Outgoing: bu node'dan başka node'lara giden bağlantılar
	const outgoing = await db
		.select({
			source: links.source,
			target: links.target,
			targetTitle: nodes.title,
			targetType: nodes.type,
		})
		.from(links)
		.innerJoin(
			nodes,
			and(
				eq(nodes.workspaceId, links.workspaceId),
				eq(nodes.id, links.target),
			),
		)
		.where(and(eq(links.workspaceId, ws.id), eq(links.source, nodeId)))
		.orderBy(asc(nodes.title))

	// Incoming: başka node'lardan bu node'a gelen bağlantılar
	const incoming = await db
		.select({
			source: links.source,
			target: links.target,
			sourceTitle: nodes.title,
			sourceType: nodes.type,
		})
		.from(links)
		.innerJoin(
			nodes,
			and(
				eq(nodes.workspaceId, links.workspaceId),
				eq(nodes.id, links.source),
			),
		)
		.where(and(eq(links.workspaceId, ws.id), eq(links.target, nodeId)))
		.orderBy(asc(nodes.title))

	return { outgoing, incoming }
}

// Link selector dropdown için hafif node listesi (id + title + type)
export async function getAllNodeTitles(excludeId?: string) {
	const ws = await requireWorkspace()

	const conditions = [eq(nodes.workspaceId, ws.id)]
	if (excludeId) conditions.push(ne(nodes.id, excludeId))

	return db
		.select({
			id: nodes.id,
			title: nodes.title,
			type: nodes.type,
		})
		.from(nodes)
		.where(and(...conditions))
		.orderBy(asc(nodes.title))
}

export async function createNode(data: Omit<NewNode, "workspaceId">) {
	const ws = await requireWorkspace()
	await assertNodeCapacity(ws, 1)
	await db.insert(nodes).values({ ...data, workspaceId: ws.id })
	revalidateGraph()
}

export async function updateNode(
	id: string,
	data: Partial<Omit<NewNode, "workspaceId" | "id">>,
) {
	const ws = await requireWorkspace()
	await db
		.update(nodes)
		.set(data)
		.where(and(eq(nodes.workspaceId, ws.id), eq(nodes.id, id)))
	revalidateGraph()
}

export async function deleteNode(id: string) {
	const ws = await requireWorkspace()
	await db
		.delete(nodes)
		.where(and(eq(nodes.workspaceId, ws.id), eq(nodes.id, id)))
	revalidateGraph()
}

export async function createLink(source: string, target: string) {
	const ws = await requireWorkspace()
	await db
		.insert(links)
		.values({ workspaceId: ws.id, source, target })
		.onConflictDoNothing()
	revalidatePath("/")
}

export async function deleteLink(source: string, target: string) {
	const ws = await requireWorkspace()
	await db
		.delete(links)
		.where(
			and(
				eq(links.workspaceId, ws.id),
				eq(links.source, source),
				eq(links.target, target),
			),
		)
	revalidatePath("/")
}
