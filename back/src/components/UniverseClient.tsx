"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import KnowledgeGraph3D from "@/components/graph/KnowledgeGraph3D"
import { BRAND } from "@/lib/brand"
import type { GraphData, GraphNode } from "@/lib/types"

export default function UniverseClient({
	data,
	loggedIn = false,
	view = "all",
}: {
	data: GraphData
	loggedIn?: boolean
	view?: "all" | "network"
}) {
	const router = useRouter()

	function handleNodeClick(node: GraphNode) {
		// node.id = slug → o kişinin galaksisine git
		const slug = String(node.id)
		if (slug) router.push(`/u/${slug}`)
	}

	const empty = data.nodes.length === 0

	return (
		<div className="relative w-screen h-screen overflow-hidden bg-[#000011]">
			<KnowledgeGraph3D
				graphData={data}
				onNodeClick={handleNodeClick}
				backgroundColor="#000011"
				nodeLabelHtml={(n) =>
					`<b>${n.title}</b><br/><span style="color:#8b5cf6">${n.val} node</span>`
				}
			/>

			{/* Üst overlay */}
			<div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 py-5">
				<span className="font-semibold text-white/90 tracking-tight">
					<span className="text-purple-400">✦</span> {BRAND}
				</span>
				<div className="flex items-center gap-3 text-sm">
					<Link
						href="/explore"
						className="text-white/60 hover:text-white/90 transition-colors"
					>
						Explore
					</Link>
					<Link
						href="/welcome"
						className="text-white/60 hover:text-white/90 transition-colors"
					>
						How it works
					</Link>
					<Link
						href="/admin/login"
						className="text-white/60 hover:text-white/90 transition-colors"
					>
						Sign in
					</Link>
					<Link
						href="/admin/login"
						className="px-4 py-2 rounded-full bg-purple-500/30 hover:bg-purple-500/45 border border-purple-400/30 text-white transition-colors"
					>
						Create your galaxy
					</Link>
				</div>
			</div>

			{/* Başlık */}
			<div className="absolute top-24 inset-x-0 z-10 text-center px-6 pointer-events-none">
				<h1 className="text-3xl sm:text-4xl font-extrabold text-white/95 tracking-tight">
					{view === "network" ? "Your network" : "One universe, every mind"}
				</h1>
				<p className="text-white/45 text-sm mt-2">
					Each color is one mind. Click a star to enter their galaxy.
				</p>

				{loggedIn && (
					<div className="inline-flex mt-4 rounded-full bg-white/[0.06] border border-white/[0.1] p-1 pointer-events-auto">
						<Link
							href="/"
							className={`px-4 py-1.5 rounded-full text-xs transition-colors ${
								view === "all"
									? "bg-white/[0.12] text-white/90"
									: "text-white/50 hover:text-white/80"
							}`}
						>
							All
						</Link>
						<Link
							href="/?view=network"
							className={`px-4 py-1.5 rounded-full text-xs transition-colors ${
								view === "network"
									? "bg-white/[0.12] text-white/90"
									: "text-white/50 hover:text-white/80"
							}`}
						>
							My network
						</Link>
					</div>
				)}
			</div>

			{empty && (
				<div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
					<p className="text-white/40 text-sm">
						The universe is empty — be the first to add a galaxy.
					</p>
				</div>
			)}
		</div>
	)
}
