import { useState, useCallback } from "react"
import KnowledgeGraph from "../components/KnowledgeGraph"
import type { GraphNode } from "../components/KnowledgeGraph"
import SearchOverlay from "../components/SearchOverlay"
import ContentPanel from "../components/ContentPanel"
import { contentNodes } from "../data/contentData"

export default function HomeAuthRoute() {
	const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

	const handleSelectNode = useCallback((nodeId: string) => {
		setFocusNodeId(nodeId)
		setTimeout(() => setFocusNodeId(null), 1200)

		// Also open the panel
		const node = contentNodes.find((n) => n.id === nodeId)
		if (node) {
			setTimeout(() => {
				setSelectedNode(node as GraphNode)
			}, 600)
		}
	}, [])

	const handleNodeClick = useCallback((node: GraphNode) => {
		setSelectedNode(node)
	}, [])

	const handleClosePanel = useCallback(() => {
		setSelectedNode(null)
	}, [])

	return (
		<div className="relative w-screen h-screen overflow-hidden bg-black">
			{/* 3D graph background */}
			<KnowledgeGraph
				onNodeClick={handleNodeClick}
				focusNodeId={focusNodeId}
			/>

			{/* Search overlay */}
			<SearchOverlay onSelectNode={handleSelectNode} />

			{/* Content panel */}
			<ContentPanel node={selectedNode} onClose={handleClosePanel} />

			{/* Bottom-right branding */}
			<div className="fixed bottom-5 right-5 z-30 select-none">
				<span className="text-white/15 text-xs font-medium tracking-wider">
					mustafa.dev
				</span>
			</div>
		</div>
	)
}
