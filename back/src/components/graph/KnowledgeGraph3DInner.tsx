"use client"

import { useRef, useCallback, useEffect, useMemo, useState } from "react"
import ForceGraph3D from "react-force-graph-3d"
import { TYPE_COLORS } from "@/lib/constants"
import type { GraphData, GraphNode } from "@/lib/types"

interface Props {
	graphData: GraphData
	onNodeClick?: (node: GraphNode) => void
	focusNodeId?: string | null
	backgroundColor?: string
	nodeLabelHtml?: (n: GraphNode) => string
	// true: renk node TİPİNE göre (kişi galaksisi). false: category'e göre auto (evren).
	colorByType?: boolean
}

// mustafakırpık.com'daki 3D "samanyolu" görünümünün birebir platform portu.
// SSR'de yüklenmez (KnowledgeGraph3D dynamic ssr:false ile sarmalar).
export default function KnowledgeGraph3DInner({
	graphData,
	onNodeClick,
	focusNodeId,
	backgroundColor = "#000011",
	nodeLabelHtml,
	colorByType = false,
}: Props) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const graphRef = useRef<any>(null)
	const [dimensions, setDimensions] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
	})

	const data = useMemo(
		() => ({
			nodes: graphData.nodes.map((n) => ({
				...n,
				category: n.meta?.category || n.cluster || "",
			})),
			links: graphData.links.map((l) => ({ ...l })),
		}),
		[graphData],
	)

	useEffect(() => {
		const onResize = () =>
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		onResize()
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [])

	// Aramadan gelen node'a kamera odakla
	useEffect(() => {
		if (!focusNodeId || !graphRef.current) return
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const node = data.nodes.find((n) => n.id === focusNodeId) as any
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
	}, [focusNodeId, data.nodes])

	const handleNodeClick = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(node: any) => {
			// Dekoratif arka plan yıldızı — tıklamayı yok say (kamera bile oynamasın).
			if (node.decorative) return
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
				graphData={data}
				{...(colorByType
					? {
							nodeColor: (node: object) =>
								TYPE_COLORS[(node as GraphNode).type] || "#8b8b9a",
						}
					: {
							nodeAutoColorBy: "category",
							// Gerçek node'lar auto-renk (n.color) kalır; dekoratif olanlar
							// soluk lacivert-gri → arka plana çekilir, öndekilerle yarışmaz.
							nodeColor: (node: object) => {
								const n = node as GraphNode
								return n.decorative ? "#2b2f45" : n.color || "#8b8b9a"
							},
						})}
				nodeLabel={(node: object) => {
					const n = node as GraphNode
					// Dekoratif yıldızların adı yok — hover ipucu göstermeyiz.
					if (n.decorative) return ""
					if (nodeLabelHtml) return nodeLabelHtml(n)
					const color = TYPE_COLORS[n.type] || "#fff"
					return `<b>${n.title}</b><br/><span style="color:${color}">${n.type}</span>`
				}}
				nodeVal={(node: object) => (node as GraphNode).val ?? 1}
				onNodeClick={handleNodeClick}
				linkDirectionalParticles={1}
				backgroundColor={backgroundColor}
				showNavInfo={false}
			/>
		</div>
	)
}
