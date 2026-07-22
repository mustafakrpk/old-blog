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
	accent?: string
}

export default function HomeClient({
	initialData,
	slug,
	initialMode = "professional",
	bg = "#000011",
	accent = "#a78bfa",
}: HomeClientProps) {
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
	const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
	const [allNodes, setAllNodes] = useState<GraphNode[]>(initialData.nodes)
	// Sinematik giriş: graph bir kare siyahtan sonra yumuşakça belirir.
	const [entered, setEntered] = useState(false)

	useEffect(() => {
		const t = setTimeout(() => setEntered(true), 60)
		return () => clearTimeout(t)
	}, [])

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
			style={
				{ backgroundColor: bg, "--accent": accent } as React.CSSProperties
			}
		>
			<GraphCanvas
				initialData={initialData}
				initialMode={initialMode}
				onNodeClick={handleNodeClick}
				focusNodeId={focusNodeId}
				onDataChange={handleDataChange}
				slug={slug}
				backgroundColor={bg}
				entered={entered}
			/>

			{/* Okunabilirlik katmanları — overlay metinleri parlak node'ların
			    üstüne denk geldiğinde de okunur kalsın. */}
			<div className="pointer-events-none absolute inset-0 z-20 vignette" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-40 z-20 scrim-top" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-20 scrim-bottom" />

			<SearchOverlay
				nodes={allNodes}
				onSelectNode={handleSelectFromSearch}
			/>

			<ContentPanel node={selectedNode} onClose={handleClosePanel} />
		</div>
	)
}
