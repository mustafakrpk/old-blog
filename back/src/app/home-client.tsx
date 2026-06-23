"use client"

import { useState, useCallback, useEffect } from "react"
import GraphCanvas from "@/components/graph/GraphCanvas"
import SearchOverlay from "@/components/SearchOverlay"
import ContentPanel from "@/components/ContentPanel"
import type { FocusMode, GraphData, GraphNode } from "@/lib/types"

interface HomeClientProps {
	initialData: GraphData
	slug?: string
	initialMode?: FocusMode
	bg?: string
}

export default function HomeClient({
	initialData,
	slug,
	initialMode = "professional",
	bg = "#000011",
}: HomeClientProps) {
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
	const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
	const [allNodes, setAllNodes] = useState<GraphNode[]>(initialData.nodes)

	// Public viewer (slug var) → ziyaret sayacı beacon'ı (bir kez).
	useEffect(() => {
		if (!slug) return
		fetch("/api/track", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ slug }),
		}).catch(() => {})
	}, [slug])

	const handleNodeClick = useCallback((node: GraphNode) => {
		setSelectedNode(node)
	}, [])

	const handleSelectFromSearch = useCallback(
		(nodeId: string) => {
			const node = allNodes.find((n) => n.id === nodeId)
			if (node) {
				setSelectedNode(node)
				setFocusNodeId(nodeId)
				setTimeout(() => setFocusNodeId(null), 1000)
			}
		},
		[allNodes],
	)

	const handleClosePanel = useCallback(() => {
		setSelectedNode(null)
	}, [])

	const handleDataChange = useCallback((nodes: GraphNode[]) => {
		setAllNodes(nodes)
	}, [])

	return (
		<div
			className="relative w-screen h-screen overflow-hidden"
			style={{ backgroundColor: bg }}
		>
			<GraphCanvas
				initialData={initialData}
				initialMode={initialMode}
				onNodeClick={handleNodeClick}
				focusNodeId={focusNodeId}
				onDataChange={handleDataChange}
				slug={slug}
				backgroundColor={bg}
			/>

			<SearchOverlay
				nodes={allNodes}
				onSelectNode={handleSelectFromSearch}
			/>

			<ContentPanel node={selectedNode} onClose={handleClosePanel} />
		</div>
	)
}
