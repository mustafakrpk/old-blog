"use server"

import { db } from "@/db"
import { nodes, links } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import type { FocusMode, GraphData } from "@/lib/types"

export async function getGraphData(mode: FocusMode): Promise<GraphData> {
	let dbNodes

	switch (mode) {
		case "professional":
			dbNodes = await db
				.select()
				.from(nodes)
				.where(eq(nodes.visibility, "professional"))
			break
		case "explorer":
			dbNodes = await db
				.select()
				.from(nodes)
				.where(
					inArray(nodes.visibility, ["professional", "explorer"]),
				)
			break
		case "god_mode":
			dbNodes = await db.select().from(nodes)
			break
	}

	const nodeIds = new Set(dbNodes.map((n) => n.id))
	const allLinks = await db.select().from(links)
	const filteredLinks = allLinks.filter(
		(l) => nodeIds.has(l.source) && nodeIds.has(l.target),
	)

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
