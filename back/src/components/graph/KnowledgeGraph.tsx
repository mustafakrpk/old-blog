"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { forceX, forceY, forceCollide } from "d3-force"
import { CLUSTER_POSITIONS, TYPE_COLORS } from "@/lib/constants"
import type { GraphNode, GraphData, FocusMode } from "@/lib/types"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
	ssr: false,
})

interface KnowledgeGraphProps {
	graphData: GraphData
	mode: FocusMode
	onNodeClick?: (node: GraphNode) => void
	focusNodeId?: string | null
}

export default function KnowledgeGraph({
	graphData,
	mode,
	onNodeClick,
	focusNodeId,
}: KnowledgeGraphProps) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const graphRef = useRef<any>(null)
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

	// Set dimensions after mount (SSR-safe)
	useEffect(() => {
		setDimensions({
			width: window.innerWidth,
			height: window.innerHeight,
		})
		const onResize = () =>
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [])

	// Apply spatial clustering forces
	useEffect(() => {
		if (!graphRef.current) return
		const fg = graphRef.current

		fg.d3Force(
			"x",
			forceX<GraphNode>()
				.x(
					(node) =>
						CLUSTER_POSITIONS[node.cluster]?.x ?? 0,
				)
				.strength(0.15),
		)
		fg.d3Force(
			"y",
			forceY<GraphNode>()
				.y(
					(node) =>
						CLUSTER_POSITIONS[node.cluster]?.y ?? 0,
				)
				.strength(0.15),
		)
		fg.d3Force(
			"collision",
			forceCollide<GraphNode>().radius(
				(node) => Math.sqrt(node.val ?? 1) * 4,
			),
		)

		fg.d3ReheatSimulation()
	}, [graphData, mode])

	// Focus on search result
	useEffect(() => {
		if (!focusNodeId || !graphRef.current) return
		const node = graphData.nodes.find((n) => n.id === focusNodeId)
		if (node && node.x !== undefined && node.y !== undefined) {
			graphRef.current.centerAt(node.x, node.y, 1000)
			graphRef.current.zoom(4, 1000)
		}
	}, [focusNodeId, graphData.nodes])

	const handleNodeClick = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(node: any) => {
			const n = node as GraphNode
			graphRef.current?.centerAt(n.x, n.y, 800)
			graphRef.current?.zoom(4, 800)
			onNodeClick?.(n)
		},
		[onNodeClick],
	)

	// LOD Canvas Renderer
	const paintNode = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const n = node as GraphNode
			const x = n.x ?? 0
			const y = n.y ?? 0
			const color = TYPE_COLORS[n.type] || "#666"
			const radius = Math.sqrt(n.val ?? 1) * 2.5

			// Hub glow
			if (n.type === "hub") {
				ctx.beginPath()
				ctx.arc(x, y, radius * 3, 0, 2 * Math.PI)
				const gradient = ctx.createRadialGradient(
					x,
					y,
					0,
					x,
					y,
					radius * 3,
				)
				gradient.addColorStop(0, "rgba(255,255,255,0.15)")
				gradient.addColorStop(1, "transparent")
				ctx.fillStyle = gradient
				ctx.fill()
			}

			// Low zoom: circles only
			if (globalScale < 1.5) {
				ctx.beginPath()
				ctx.arc(x, y, radius, 0, 2 * Math.PI)
				ctx.fillStyle = color
				ctx.globalAlpha = n.type === "hub" ? 1 : 0.7
				ctx.fill()
				ctx.globalAlpha = 1
				return
			}

			// Medium zoom: circle + label for important nodes
			if (globalScale < 3.5) {
				ctx.beginPath()
				ctx.arc(x, y, radius * 1.2, 0, 2 * Math.PI)
				ctx.fillStyle = color
				ctx.globalAlpha = 0.85
				ctx.fill()
				ctx.globalAlpha = 1

				if ((n.val ?? 1) >= 3) {
					const fontSize = Math.max(10 / globalScale, 2)
					ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`
					ctx.textAlign = "center"
					ctx.textBaseline = "top"
					ctx.fillStyle = "rgba(255,255,255,0.8)"
					ctx.fillText(n.title, x, y + radius * 1.5)
				}
				return
			}

			// High zoom: pill + label
			const label = n.title
			const fontSize = Math.max(11 / globalScale, 2.5)
			ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
			const textWidth = ctx.measureText(label).width
			const pillW = textWidth + fontSize * 1.6
			const pillH = fontSize * 2
			const r = pillH / 2

			ctx.beginPath()
			ctx.moveTo(x - pillW / 2 + r, y - pillH / 2)
			ctx.lineTo(x + pillW / 2 - r, y - pillH / 2)
			ctx.arc(x + pillW / 2 - r, y, r, -Math.PI / 2, Math.PI / 2)
			ctx.lineTo(x - pillW / 2 + r, y + pillH / 2)
			ctx.arc(
				x - pillW / 2 + r,
				y,
				r,
				Math.PI / 2,
				(3 * Math.PI) / 2,
			)
			ctx.closePath()

			ctx.fillStyle = color + "30"
			ctx.fill()
			ctx.strokeStyle = color
			ctx.lineWidth = 0.3
			ctx.stroke()

			ctx.fillStyle = "#fff"
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.fillText(label, x, y)
		},
		[],
	)

	if (dimensions.width === 0) return null

	return (
		<ForceGraph2D
			ref={graphRef}
			width={dimensions.width}
			height={dimensions.height}
			graphData={graphData}
			nodeCanvasObject={paintNode}
			nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
				const n = node as GraphNode
				const size = Math.sqrt(n.val ?? 1) * 4
				ctx.beginPath()
				ctx.arc(n.x ?? 0, n.y ?? 0, size, 0, 2 * Math.PI)
				ctx.fillStyle = color
				ctx.fill()
			}}
			onNodeClick={handleNodeClick}
			nodeLabel={(node: any) => {
				const n = node as GraphNode
				const color = TYPE_COLORS[n.type] || "#fff"
				const desc = n.meta?.description || ""
				return `<b style="color:${color}">${n.title}</b>${desc ? `<br/><span style="color:#999">${desc}</span>` : ""}`
			}}
			linkColor={() => "rgba(255,255,255,0.06)"}
			linkWidth={0.4}
			d3AlphaDecay={0.02}
			d3VelocityDecay={0.3}
			cooldownTicks={200}
			backgroundColor="#000011"
			enableNodeDrag={true}
			minZoom={0.3}
			maxZoom={12}
		/>
	)
}
