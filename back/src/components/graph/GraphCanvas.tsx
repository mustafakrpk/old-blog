"use client"

import { useState, useCallback } from "react"
import KnowledgeGraph3D from "./KnowledgeGraph3D"
import ModeSwitcher from "./ModeSwitcher"
import StarCluster from "./StarCluster"
import type { FocusMode, GraphData, GraphNode } from "@/lib/types"

interface GraphCanvasProps {
	initialData: GraphData
	initialMode: FocusMode
	onNodeClick?: (node: GraphNode) => void
	focusNodeId?: string | null
	onDataChange?: (nodes: GraphNode[]) => void
	/** Hangi workspace'in graph'ı (multi-tenant viewer). Yoksa API default'a düşer. */
	slug?: string
	backgroundColor?: string
	/** Sinematik giriş: false iken graph görünmez, true olunca yumuşakça belirir. */
	entered?: boolean
}

function transformBlocksData(blocks: {
	nodes: Array<{ id: string; user: string; description: string }>
	links: Array<{ source: string; target: string }>
}): GraphData {
	return {
		nodes: blocks.nodes.map((n) => ({
			id: `b-${n.id}`,
			title: n.description || n.id,
			type: "dataset",
			cluster: "playground",
			visibility: "god_mode",
			val: 1,
			meta: { description: `by ${n.user}`, category: "D3 Blocks" },
		})),
		links: blocks.links.map((l) => ({
			source: `b-${l.source}`,
			target: `b-${l.target}`,
		})),
	}
}

function mergeGraphData(base: GraphData, extra: GraphData): GraphData {
	return {
		nodes: [...base.nodes, ...extra.nodes],
		links: [...base.links, ...extra.links],
	}
}

export default function GraphCanvas({
	initialData,
	initialMode,
	onNodeClick,
	focusNodeId,
	onDataChange,
	slug,
	backgroundColor,
	entered = true,
}: GraphCanvasProps) {
	const [mode, setMode] = useState<FocusMode>(initialMode)
	const [graphData, setGraphData] = useState<GraphData>(initialData)
	const [loading, setLoading] = useState(false)
	const [blocksCache, setBlocksCache] = useState<GraphData | null>(null)

	const handleModeChange = useCallback(
		async (newMode: FocusMode) => {
			setLoading(true)
			setMode(newMode)

			try {
				const params = new URLSearchParams({ mode: newMode })
				if (slug) params.set("u", slug)
				const res = await fetch(`/api/graph?${params}`)
				const dbData: GraphData = await res.json()

				if (newMode === "god_mode") {
					let blocks = blocksCache
					if (!blocks) {
						try {
							const bRes = await fetch(
								"/api/datasets/blocks",
							)
							const raw = await bRes.json()
							blocks = transformBlocksData(raw)
							setBlocksCache(blocks)
						} catch {
							blocks = { nodes: [], links: [] }
						}
					}
					const merged = mergeGraphData(dbData, blocks)
					setGraphData(merged)
					onDataChange?.(merged.nodes)
				} else {
					setGraphData(dbData)
					onDataChange?.(dbData.nodes)
				}
			} catch (err) {
				console.error("Failed to fetch graph data:", err)
			}

			setLoading(false)
		},
		[blocksCache, onDataChange, slug],
	)

	return (
		<div className="absolute inset-0">
			<ModeSwitcher
				currentMode={mode}
				onModeChange={handleModeChange}
				loading={loading}
				nodeCounts={{
					professional: mode === "professional" ? graphData.nodes.length : undefined,
					explorer: mode === "explorer" ? graphData.nodes.length : undefined,
					god_mode: mode === "god_mode" ? graphData.nodes.length : undefined,
				} as Record<string, number>}
			/>

			{loading ? (
				<div
					className="absolute inset-0 flex items-center justify-center"
					style={{ backgroundColor: backgroundColor ?? "#000011" }}
				>
					<StarCluster label="Gathering stars" />
				</div>
			) : (
				<div
					className="absolute inset-0 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
					style={{ opacity: entered ? 1 : 0 }}
				>
					<KnowledgeGraph3D
						graphData={graphData}
						onNodeClick={onNodeClick}
						focusNodeId={focusNodeId}
						backgroundColor={backgroundColor}
						colorByType
					/>
				</div>
			)}
		</div>
	)
}
