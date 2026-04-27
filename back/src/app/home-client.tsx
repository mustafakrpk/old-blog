"use client"

import { useState, useCallback } from "react"
import GraphCanvas from "@/components/graph/GraphCanvas"
import SearchOverlay from "@/components/SearchOverlay"
import ContentPanel from "@/components/ContentPanel"
import type { GraphData, GraphNode } from "@/lib/types"

interface HomeClientProps {
	initialData: GraphData
}

export default function HomeClient({ initialData }: HomeClientProps) {
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
	const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
	const [allNodes, setAllNodes] = useState<GraphNode[]>(initialData.nodes)

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
		<div className="relative w-screen h-screen overflow-hidden bg-[#000011]">
			<GraphCanvas
				initialData={initialData}
				initialMode="professional"
				onNodeClick={handleNodeClick}
				focusNodeId={focusNodeId}
				onDataChange={handleDataChange}
			/>

			<SearchOverlay
				nodes={allNodes}
				onSelectNode={handleSelectFromSearch}
			/>

			<ContentPanel node={selectedNode} onClose={handleClosePanel} />
		</div>
	)
}
