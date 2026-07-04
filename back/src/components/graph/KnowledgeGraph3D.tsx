"use client"

import dynamic from "next/dynamic"
import type { GraphData, GraphNode } from "@/lib/types"

// ForceGraph3D WebGL/window kullanır → SSR'de yüklenmemeli.
// Inner bileşeni ssr:false ile yükleriz; ref Inner içinde kaldığı için
// next/dynamic ref-forwarding sorunu yaşanmaz.
const Inner = dynamic(() => import("./KnowledgeGraph3DInner"), {
	ssr: false,
	loading: () => (
		<div className="absolute inset-0 flex items-center justify-center">
			<div className="relative w-16 h-16">
				<div className="absolute inset-0 rounded-full border-2 border-white/10" />
				<div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
			</div>
		</div>
	),
})

interface Props {
	graphData: GraphData
	onNodeClick?: (node: GraphNode) => void
	focusNodeId?: string | null
	backgroundColor?: string
	nodeLabelHtml?: (n: GraphNode) => string
	colorByType?: boolean
}

export default function KnowledgeGraph3D(props: Props) {
	return <Inner {...props} />
}
