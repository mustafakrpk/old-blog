import { useState, useCallback, useEffect } from "react"
import KnowledgeGraph from "../components/KnowledgeGraph"
import type { GraphNode } from "../components/KnowledgeGraph"
import SearchOverlay from "../components/SearchOverlay"
import ContentPanel from "../components/ContentPanel"

const API_URL = "http://localhost:3000/api/graph"

interface ApiNode {
	id: string
	title: string
	type: string
	cluster: string
	visibility: string
	val: number
	content?: string | null
	meta?: {
		description?: string
		date?: string
		tags?: string[]
		image?: string
		link?: string
		category?: string
	} | null
}

interface ApiResponse {
	nodes: ApiNode[]
	links: Array<{ source: string; target: string }>
}

function apiNodeToGraphNode(n: ApiNode): GraphNode {
	return {
		id: n.id,
		title: n.title,
		type: n.type as GraphNode["type"],
		category: n.meta?.category || n.cluster || "",
		description: n.meta?.description || "",
		content: n.content || undefined,
		date: n.meta?.date,
		tags: n.meta?.tags,
		image: n.meta?.image,
		link: n.meta?.link,
		val: n.val,
	}
}

export default function HomeAuthRoute() {
	const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
	const [nodes, setNodes] = useState<GraphNode[]>([])
	const [links, setLinks] = useState<Array<{ source: string; target: string }>>([])
	const [loading, setLoading] = useState(true)

	// Fetch all nodes from API (god_mode = everything)
	useEffect(() => {
		fetch(`${API_URL}?mode=god_mode`)
			.then((res) => res.json())
			.then((data: ApiResponse) => {
				setNodes(data.nodes.map(apiNodeToGraphNode))
				setLinks(data.links)
				setLoading(false)
			})
			.catch((err) => {
				console.error("Failed to fetch graph data:", err)
				setLoading(false)
			})
	}, [])

	const handleSelectNode = useCallback(
		(nodeId: string) => {
			setFocusNodeId(nodeId)
			setTimeout(() => setFocusNodeId(null), 1200)

			const node = nodes.find((n) => n.id === nodeId)
			if (node) {
				setTimeout(() => {
					setSelectedNode(node)
				}, 600)
			}
		},
		[nodes],
	)

	const handleNodeClick = useCallback((node: GraphNode) => {
		setSelectedNode(node)
	}, [])

	const handleClosePanel = useCallback(() => {
		setSelectedNode(null)
	}, [])

	if (loading) {
		return (
			<div className="relative w-screen h-screen overflow-hidden bg-[#000011] flex items-center justify-center">
				<div className="text-center">
					<div className="relative w-16 h-16 mx-auto mb-6">
						<div className="absolute inset-0 rounded-full border-2 border-white/10" />
						<div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
					</div>
					<p className="text-white/50 text-sm font-medium tracking-wider">
						Loading Knowledge Graph...
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="relative w-screen h-screen overflow-hidden bg-black">
			{/* 3D graph background */}
			<KnowledgeGraph
				nodes={nodes}
				links={links}
				onNodeClick={handleNodeClick}
				focusNodeId={focusNodeId}
			/>

			{/* Search overlay */}
			<SearchOverlay nodes={nodes} onSelectNode={handleSelectNode} />

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
