"use client"

import { useEffect, useRef } from "react"
import Markdown from "react-markdown"
import { TYPE_COLORS } from "@/lib/constants"
import type { GraphNode } from "@/lib/types"

interface ContentPanelProps {
	node: GraphNode | null
	onClose: () => void
}

export default function ContentPanel({ node, onClose }: ContentPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null)

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}
		if (node) document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	}, [node, onClose])

	// Scroll to top on node change
	useEffect(() => {
		if (node && panelRef.current) {
			const scrollEl = panelRef.current.querySelector(".overflow-y-auto")
			if (scrollEl) scrollEl.scrollTop = 0
		}
	}, [node])

	const color = TYPE_COLORS[node?.type ?? ""] || "#fff"
	const meta = node?.meta

	return (
		<>
			{/* Backdrop */}
			<div
				onClick={onClose}
				className={`
					fixed inset-0 z-40 bg-black/40 backdrop-blur-sm
					transition-opacity duration-300
					${node ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"}
				`}
			/>

			{/* Panel */}
			<div
				ref={panelRef}
				className={`
					fixed top-0 right-0 z-50 h-full w-full max-w-xl
					bg-[#0c0c14]/95 backdrop-blur-2xl
					border-l border-white/[0.06]
					shadow-[-8px_0_40px_rgba(0,0,0,0.6)]
					transition-transform duration-300 ease-out
					${node ? "translate-x-0" : "translate-x-full"}
				`}
			>
				{node && (
					<div className="h-full flex flex-col">
						{/* Header */}
						<div className="flex-shrink-0 px-8 pt-8 pb-4">
							<button
								onClick={onClose}
								className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors text-white/40 hover:text-white/70"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>

							{/* Type badge */}
							<span
								className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3"
								style={{
									backgroundColor: color + "18",
									color: color,
								}}
							>
								{node.type}
							</span>

							{/* Date */}
							{meta?.date && (
								<p className="text-white/25 text-xs mb-2">
									{new Date(
										meta.date,
									).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</p>
							)}

							{/* Title */}
							<h2 className="text-2xl font-bold text-white/90 leading-tight">
								{node.title}
							</h2>

							{/* Description */}
							{meta?.description && (
								<p className="text-white/40 text-sm mt-2 leading-relaxed">
									{meta.description}
								</p>
							)}

							{/* Tags */}
							{meta?.tags && meta.tags.length > 0 && (
								<div className="flex flex-wrap gap-1.5 mt-3">
									{meta.tags.map((tag) => (
										<span
											key={tag}
											className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/35"
										>
											{tag}
										</span>
									))}
								</div>
							)}

							{/* Link */}
							{meta?.link && (
								<a
									href={meta.link}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
								>
									<svg
										className="w-3 h-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
									Open link
								</a>
							)}
						</div>

						{/* Divider */}
						<div className="mx-8 border-t border-white/[0.06]" />

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-8 py-6 scroll-hide">
							{node.content ? (
								<div className="prose-custom">
									<Markdown>
										{node.content}
									</Markdown>
								</div>
							) : (
								<p className="text-white/20 text-sm italic">
									Content coming soon...
								</p>
							)}
						</div>
					</div>
				)}
			</div>
		</>
	)
}
