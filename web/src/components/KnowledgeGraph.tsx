import { useRef, useCallback, useEffect, useMemo, useState } from "react"
import ForceGraph3D from "react-force-graph-3d"
import {
	contentNodes,
	contentLinks,
	TYPE_COLORS,
	type ContentNode,
} from "../data/contentData"

interface GraphNode extends ContentNode {
	x?: number
	y?: number
	z?: number
	user?: string
}

export type { GraphNode }

interface KnowledgeGraphProps {
	onNodeClick?: (node: GraphNode) => void
	focusNodeId?: string | null
}

// Random tree generator (same approach as react-force-graph large-graph example)
function genRandomTree(N = 300) {
	return {
		nodes: [...Array(N).keys()].map((i) => ({
			id: `rand-${i}`,
			title: `Node ${i}`,
			type: "skill" as const,
			category: [
				"Web Development",
				"Backend",
				"AI & Data",
				"DevOps",
				"Design",
			][i % 5],
			description: `Random node ${i}`,
			val: 1,
		})),
		links: [...Array(N).keys()]
			.filter((id) => id)
			.map((id) => ({
				source: `rand-${id}`,
				target: `rand-${Math.round(Math.random() * (id - 1))}`,
			})),
	}
}

export default function KnowledgeGraph({
	onNodeClick,
	focusNodeId,
}: KnowledgeGraphProps) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const graphRef = useRef<any>()
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	})
	const [blocksData, setBlocksData] = useState<{
		nodes: Array<{ id: string; user: string; description: string }>
		links: Array<{ source: string; target: string }>
	} | null>(null)
	const [loading, setLoading] = useState(true)

	// Fetch blocks.json (1238 nodes, 2602 links) — same dataset as the large-graph example
	useEffect(() => {
		fetch("/datasets/blocks.json")
			.then((res) => res.json())
			.then((data) => {
				setBlocksData(data)
				setLoading(false)
			})
			.catch((err) => {
				console.error("Failed to load blocks.json:", err)
				setLoading(false)
			})
	}, [])

	// Merge: personal contentData + blocks.json + random tree
	const graphData = useMemo(() => {
		const pNodes = contentNodes.map((n) => ({ ...n }))
		const pLinks = contentLinks.map((l) => ({ ...l }))

		// Random tree for extra density
		const randomTree = genRandomTree(500)
		const rLinks = [
			...randomTree.links,
			{ source: "me", target: "rand-0" },
		]

		if (!blocksData) {
			return {
				nodes: [...pNodes, ...randomTree.nodes],
				links: [...pLinks, ...rLinks],
			}
		}

		// blocks.json nodes — prefix ids to avoid collision
		const bNodes = blocksData.nodes.map((n) => ({
			id: `b-${n.id}`,
			title: n.description || n.id,
			type: "skill" as const,
			category: "Web Development",
			description: n.description || "",
			user: n.user,
			val: 1,
		}))

		const bLinks = blocksData.links.map((l) => ({
			source: `b-${l.source}`,
			target: `b-${l.target}`,
		}))

		// Bridge: connect blocks cluster to personal hub
		const bridge = [
			{ source: "me", target: `b-${blocksData.nodes[0].id}` },
		]

		return {
			nodes: [...pNodes, ...bNodes, ...randomTree.nodes],
			links: [...pLinks, ...bLinks, ...bridge, ...rLinks],
		}
	}, [blocksData])

	useEffect(() => {
		const onResize = () =>
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [])

	// Focus on search result
	useEffect(() => {
		if (!focusNodeId || !graphRef.current) return
		const node = graphData.nodes.find((n) => n.id === focusNodeId) as
			| GraphNode
			| undefined
		if (node && node.x !== undefined && node.y !== undefined) {
			const distance = 60
			const distRatio =
				1 + distance / Math.hypot(node.x, node.y, node.z ?? 0)
			graphRef.current.cameraPosition(
				{
					x: node.x * distRatio,
					y: node.y * distRatio,
					z: (node.z ?? 0) * distRatio,
				},
				{ x: node.x, y: node.y, z: node.z ?? 0 },
				1200,
			)
		}
	}, [focusNodeId, graphData.nodes])

	const handleNodeClick = useCallback(
		(node: any) => {
			const distance = 60
			const distRatio =
				1 + distance / Math.hypot(node.x, node.y, node.z || 0)
			graphRef.current?.cameraPosition(
				{
					x: node.x * distRatio,
					y: node.y * distRatio,
					z: (node.z || 0) * distRatio,
				},
				{ x: node.x, y: node.y, z: node.z || 0 },
				800,
			)
			onNodeClick?.(node as GraphNode)
		},
		[onNodeClick],
	)

	// Loading screen
	if (loading) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-[#000011]">
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
		<div className="absolute inset-0">
			<ForceGraph3D
				ref={graphRef}
				width={dimensions.width}
				height={dimensions.height}
				graphData={graphData}
				nodeAutoColorBy="category"
				nodeLabel={(node: any) => {
					const n = node as GraphNode
					const color = TYPE_COLORS[n.type] || "#fff"
					const user = n.user
						? `<br/><span style="color:#999">${n.user}</span>`
						: ""
					return `<b>${n.title}</b><br/><span style="color:${color}">${n.type}</span>${user}`
				}}
				nodeVal={(node: any) => (node as GraphNode).val ?? 1}
				onNodeClick={handleNodeClick}
				linkDirectionalParticles={1}
				backgroundColor="#000011"
				showNavInfo={false}
			/>
		</div>
	)
}
