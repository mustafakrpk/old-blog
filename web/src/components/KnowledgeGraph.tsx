import { useRef, useCallback, useEffect, useMemo, useState } from "react"
import ForceGraph3D from "react-force-graph-3d"
import {
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
	nodes: GraphNode[]
	links: Array<{ source: string; target: string }>
	onNodeClick?: (node: GraphNode, screenPos: { x: number; y: number }) => void
	focusNodeId?: string | null
}

// Random tree generator for extra density
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
	nodes,
	links,
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

	// Fetch blocks.json for extra visual density
	useEffect(() => {
		fetch("/datasets/blocks.json")
			.then((res) => res.json())
			.then((data) => setBlocksData(data))
			.catch((err) => console.error("Failed to load blocks.json:", err))
	}, [])

	// Merge: DB nodes + blocks.json + random tree
	const graphData = useMemo(() => {
		const pNodes = nodes.map((n) => ({ ...n }))
		const pLinks = links.map((l) => ({ ...l }))

		// Random tree for extra density
		const randomTree = genRandomTree(500)
		const rLinks = [
			...randomTree.links,
			...(pNodes.length > 0
				? [{ source: pNodes[0].id, target: "rand-0" }]
				: []),
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

		// Bridge: connect blocks cluster to hub
		const bridge = pNodes.length > 0
			? [{ source: pNodes[0].id, target: `b-${blocksData.nodes[0].id}` }]
			: []

		return {
			nodes: [...pNodes, ...bNodes, ...randomTree.nodes],
			links: [...pLinks, ...bLinks, ...bridge, ...rLinks],
		}
	}, [nodes, links, blocksData])

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
			// Capture screen position BEFORE camera moves
			const screenPos = graphRef.current?.graph2ScreenCoords(
				node.x,
				node.y,
				node.z || 0,
			) ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }

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
			onNodeClick?.(node as GraphNode, screenPos)
		},
		[onNodeClick],
	)

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
