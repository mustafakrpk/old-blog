"use server"

import { db } from "@/db"
import { nodes, links, workspaces, pageViews } from "@/db/schema"
import { eq, and, inArray, count } from "drizzle-orm"
import type { FocusMode, GraphData } from "@/lib/types"
import { getWorkspaceBySlug, clampMode } from "@/lib/tenant"

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

const UNIVERSE_NODE_CAP = 800

/**
 * "Evren": listelenen tüm public workspace'lerin node/link'lerini tek graph'ta
 * birleştirir. Node id'leri slug ile öneklenir (`slug:id`) — global benzersizlik
 * + tıklamada kaynağı bulmak için. cluster = slug (renk kümesi = kişi).
 */
export async function getUniverseGraph(): Promise<GraphData> {
	const wss = await db
		.select({
			id: workspaces.id,
			slug: workspaces.slug,
			defaultMode: workspaces.defaultMode,
		})
		.from(workspaces)
		.where(eq(workspaces.listed, true))

	const outNodes: GraphData["nodes"] = []
	const outLinks: GraphData["links"] = []

	for (const w of wss) {
		if (outNodes.length >= UNIVERSE_NODE_CAP) break

		const ns = await db
			.select()
			.from(nodes)
			.where(
				and(
					eq(nodes.workspaceId, w.id),
					inArray(nodes.visibility, visibleLevels(w.defaultMode)),
				),
			)
		if (ns.length === 0) continue

		const idset = new Set(ns.map((n) => n.id))
		for (const n of ns) {
			outNodes.push({
				id: `${w.slug}:${n.id}`,
				title: n.title,
				type: n.type,
				cluster: w.slug, // renk = kişi
				visibility: n.visibility,
				val: n.val,
				content: null,
				meta: null,
			})
		}

		const ls = await db
			.select()
			.from(links)
			.where(eq(links.workspaceId, w.id))
		for (const l of ls) {
			if (idset.has(l.source) && idset.has(l.target)) {
				outLinks.push({
					source: `${w.slug}:${l.source}`,
					target: `${w.slug}:${l.target}`,
				})
			}
		}
	}

	return { nodes: outNodes.slice(0, UNIVERSE_NODE_CAP), links: outLinks }
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
