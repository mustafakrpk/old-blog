"use client"

import { useState, useCallback } from "react"
import KnowledgeGraph from "./KnowledgeGraph"
import ModeSwitcher from "./ModeSwitcher"
import type { FocusMode, GraphData, GraphNode } from "@/lib/types"

interface GraphCanvasProps {
	initialData: GraphData
	initialMode: FocusMode
	onNodeClick?: (node: GraphNode) => void
	focusNodeId?: string | null
	onDataChange?: (nodes: GraphNode[]) => void
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
				const res = await fetch(`/api/graph?mode=${newMode}`)
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
		[blocksCache, onDataChange],
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
				<div className="absolute inset-0 flex items-center justify-center bg-[#000011]">
					<div className="text-center">
						<div className="relative w-16 h-16 mx-auto mb-6">
							<div className="absolute inset-0 rounded-full border-2 border-white/10" />
							<div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
						</div>
						<p className="text-white/50 text-sm font-medium tracking-wider">
							Loading...
						</p>
					</div>
				</div>
			) : (
				<KnowledgeGraph
					graphData={graphData}
					mode={mode}
					onNodeClick={onNodeClick}
					focusNodeId={focusNodeId}
				/>
			)}
		</div>
	)
}
