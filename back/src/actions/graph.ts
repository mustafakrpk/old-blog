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
