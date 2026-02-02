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
}

export type { GraphNode }

interface KnowledgeGraphProps {
	onNodeClick?: (node: GraphNode) => void
	focusNodeId?: string | null
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

	const graphData = useMemo(
		() => ({
			nodes: contentNodes.map((n) => ({ ...n })),
			links: contentLinks.map((l) => ({ ...l })),
		}),
		[],
	)

	useEffect(() => {
		const onResize = () =>
			setDimensions({ width: window.innerWidth, height: window.innerHeight })
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
					return `<b>${n.title}</b><br/><span style="color:${color}">${n.type}</span>`
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
