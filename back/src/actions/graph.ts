"use server"

import { db } from "@/db"
import { nodes, links, workspaces, pageViews, follows } from "@/db/schema"
import { eq, and, inArray, count } from "drizzle-orm"
import type { FocusMode, GraphData } from "@/lib/types"
import { getWorkspaceBySlug, clampMode } from "@/lib/tenant"
import { slugify } from "@/lib/slug"

export interface PublicWorkspace {
	slug: string
	name: string
	theme: string
	nodes: number
	views: number
}

// Workspace defaultMode'una göre public görünür visibility'ler.
function visibleLevels(
	defaultMode: string,
): Array<"professional" | "explorer" | "god_mode"> {
	if (defaultMode === "god_mode")
		return ["professional", "explorer", "god_mode"]
	if (defaultMode === "explorer") return ["professional", "explorer"]
	return ["professional"]
}

const UNIVERSE_PEOPLE_CAP = 500
const UNIVERSE_LINK_CAP = 2000

/**
 * "Evren": her listelenen kişi = TEK bir yıldız.
 *  - boyut (val) = kişinin node sayısı (bilgi miktarı)
 *  - renk (cluster) = slug (kişiye özel)
 *  - bağlantı (hibrit/otomatik) = ORTAK KAVRAM: paylaşılan node başlıkları + etiketler
 *    ("benzer şeyler düşünenler komşu"). Sonra takip sistemi de eklenecek.
 * id = slug → tıklamada /u/<slug>.
 */
export async function getUniverseGraph(): Promise<GraphData> {
	const wss = await db
		.select({
			id: workspaces.id,
			slug: workspaces.slug,
			name: workspaces.name,
			defaultMode: workspaces.defaultMode,
		})
		.from(workspaces)
		.where(eq(workspaces.listed, true))
	if (wss.length === 0) return { nodes: [], links: [] }

	const wsById = new Map(wss.map((w) => [w.id, w]))
	const nodeRows = await db
		.select({
			workspaceId: nodes.workspaceId,
			title: nodes.title,
			visibility: nodes.visibility,
			meta: nodes.meta,
		})
		.from(nodes)
		.where(
			inArray(
				nodes.workspaceId,
				wss.map((w) => w.id),
			),
		)

	const countBySlug = new Map<string, number>()
	const conceptIndex = new Map<string, Set<string>>() // kavram -> slug kümesi

	for (const r of nodeRows) {
		const w = wsById.get(r.workspaceId)
		if (!w) continue
		if (!visibleLevels(w.defaultMode).includes(r.visibility)) continue

		countBySlug.set(w.slug, (countBySlug.get(w.slug) ?? 0) + 1)

		const concepts = new Set<string>([slugify(r.title)])
		const tags = (r.meta as { tags?: string[] } | null)?.tags
		if (tags) for (const t of tags) concepts.add(slugify(t))
		for (const c of concepts) {
			if (!conceptIndex.has(c)) conceptIndex.set(c, new Set())
			conceptIndex.get(c)!.add(w.slug)
		}
	}

	const people = wss
		.filter((w) => (countBySlug.get(w.slug) ?? 0) > 0)
		.slice(0, UNIVERSE_PEOPLE_CAP)
	const peopleSet = new Set(people.map((w) => w.slug))

	const outNodes: GraphData["nodes"] = people.map((w) => ({
		id: w.slug,
		title: w.name,
		type: "hub",
		cluster: w.slug, // renk = kişi
		visibility: "professional",
		val: countBySlug.get(w.slug) ?? 1, // boyut = node sayısı
		content: null,
		meta: null,
	}))

	const seen = new Set<string>()
	const outLinks: GraphData["links"] = []
	for (const slugs of conceptIndex.values()) {
		const arr = [...slugs].filter((s) => peopleSet.has(s))
		if (arr.length < 2) continue
		for (let i = 0; i < arr.length; i++) {
			for (let j = i + 1; j < arr.length; j++) {
				const key =
					arr[i] < arr[j] ? `${arr[i]}|${arr[j]}` : `${arr[j]}|${arr[i]}`
				if (seen.has(key)) continue
				seen.add(key)
				outLinks.push({ source: arr[i], target: arr[j] })
			}
		}
		if (outLinks.length >= UNIVERSE_LINK_CAP) break
	}

	// Takip bağlantıları (gerçek/sosyal) — ortak ilgiyle birleştir.
	const idToSlug = new Map(wss.map((w) => [w.id, w.slug]))
	const followRows = await db
		.select({ a: follows.followerId, b: follows.followingId })
		.from(follows)
	for (const f of followRows) {
		const s = idToSlug.get(f.a)
		const t = idToSlug.get(f.b)
		if (!s || !t || !peopleSet.has(s) || !peopleSet.has(t)) continue
		const key = s < t ? `${s}|${t}` : `${t}|${s}`
		if (seen.has(key)) continue
		seen.add(key)
		outLinks.push({ source: s, target: t })
	}

	return { nodes: outNodes, links: outLinks }
}

/** Keşfet için: listelenen, en az 1 node'u olan public graph'lar (ziyarete göre). */
export async function getPublicWorkspaces(): Promise<PublicWorkspace[]> {
	const wss = await db
		.select({
			id: workspaces.id,
			slug: workspaces.slug,
			name: workspaces.name,
			theme: workspaces.theme,
		})
		.from(workspaces)
		.where(eq(workspaces.listed, true))
	if (wss.length === 0) return []

	const nodeCounts = await db
		.select({ wid: nodes.workspaceId, c: count() })
		.from(nodes)
		.groupBy(nodes.workspaceId)
	const viewCounts = await db
		.select({ wid: pageViews.workspaceId, c: count() })
		.from(pageViews)
		.groupBy(pageViews.workspaceId)

	const nodeMap = new Map(nodeCounts.map((r) => [r.wid, r.c]))
	const viewMap = new Map(viewCounts.map((r) => [r.wid, r.c]))

	return wss
		.map((w) => ({
			slug: w.slug,
			name: w.name,
			theme: w.theme,
			nodes: nodeMap.get(w.id) ?? 0,
			views: viewMap.get(w.id) ?? 0,
		}))
		.filter((w) => w.nodes > 0)
		.sort((a, b) => b.views - a.views || b.nodes - a.nodes)
}

/**
 * Bir workspace'in public graph'ını döndürür (slug ile).
 * Gizlilik: istenen mod, workspace'in defaultMode tavanına indirgenir.
 * Bilinmeyen slug → boş graph.
 */
export async function getGraphData(
	slug: string,
	mode: FocusMode,
): Promise<GraphData> {
	const ws = await getWorkspaceBySlug(slug)
	if (!ws) return { nodes: [], links: [] }

	const effectiveMode = clampMode(mode, ws.defaultMode)
	const inWorkspace = eq(nodes.workspaceId, ws.id)

	let dbNodes
	switch (effectiveMode) {
		case "professional":
			dbNodes = await db
				.select()
				.from(nodes)
				.where(and(inWorkspace, eq(nodes.visibility, "professional")))
			break
		case "explorer":
			dbNodes = await db
				.select()
				.from(nodes)
				.where(
					and(
						inWorkspace,
						inArray(nodes.visibility, ["professional", "explorer"]),
					),
				)
			break
		case "god_mode":
			dbNodes = await db.select().from(nodes).where(inWorkspace)
			break
	}

	const nodeIds = new Set(dbNodes.map((n) => n.id))
	const wsLinks = await db
		.select()
		.from(links)
		.where(eq(links.workspaceId, ws.id))
	const filteredLinks = wsLinks
		.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
		.map((l) => ({ source: l.source, target: l.target }))

	return {
		nodes: dbNodes.map((n) => ({
			id: n.id,
			title: n.title,
			type: n.type,
			cluster: n.cluster,
			visibility: n.visibility,
			val: n.val,
			content: n.content,
			meta: n.meta as GraphData["nodes"][0]["meta"],
		})),
		links: filteredLinks,
	}
}
