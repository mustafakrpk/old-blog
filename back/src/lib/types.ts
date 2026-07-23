export type FocusMode = "professional" | "explorer" | "god_mode"

export interface GraphNode {
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
	// d3-force runtime
	x?: number
	y?: number
	fx?: number
	fy?: number
}

export interface GraphLink {
	source: string
	target: string
}

export interface GraphData {
	nodes: GraphNode[]
	links: GraphLink[]
}
