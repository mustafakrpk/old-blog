"use server"

import { db } from "@/db"
import { nodes, links } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import type { FocusMode, GraphData } from "@/lib/types"
import { getWorkspaceBySlug, clampMode } from "@/lib/tenant"

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
