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

	// Sadece DB'den gelen node + link kullan
	const graphData = useMemo(() => {
		return {
			nodes: nodes.map((n) => ({ ...n })),
			links: links.map((l) => ({ ...l })),
		}
	}, [nodes, links])

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
