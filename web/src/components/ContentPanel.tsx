import { useEffect, useRef } from "react"
import Markdown from "react-markdown"
import { TYPE_COLORS, type ContentNode } from "../data/contentData"

interface ContentPanelProps {
	node: ContentNode | null
	onClose: () => void
}

export default function ContentPanel({ node, onClose }: ContentPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null)

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}
		document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	}, [onClose])

	// Close on click outside
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				onClose()
			}
		}
		if (node) {
			document.addEventListener("mousedown", handler)
		}
		return () => document.removeEventListener("mousedown", handler)
	}, [node, onClose])

	// Scroll to top when node changes
	useEffect(() => {
		if (node && panelRef.current) {
			panelRef.current.scrollTop = 0
		}
	}, [node])

	const accentColor = node ? TYPE_COLORS[node.type] : "#fff"

	return (
		<>
			{/* Backdrop */}
			<div
				className={`
					fixed inset-0 z-40 bg-black/40 backdrop-blur-sm
					transition-opacity duration-300
					${node ? "opacity-100" : "opacity-0 pointer-events-none"}
				`}
			/>

			{/* Panel */}
			<div
				ref={panelRef}
				className={`
					fixed top-0 right-0 z-50 h-full w-full max-w-xl
					overflow-y-auto
					bg-[#0c0c14]/95 backdrop-blur-2xl
					border-l border-white/[0.06]
					shadow-[-8px_0_40px_rgba(0,0,0,0.6)]
					transition-transform duration-300 ease-out
					${node ? "translate-x-0" : "translate-x-full"}
				`}
			>
				{node && (
					<div className="p-8">
						{/* Close button */}
						<button
							onClick={onClose}
							className="
								absolute top-5 right-5
								w-8 h-8 flex items-center justify-center
								rounded-lg bg-white/5 border border-white/10
								text-white/40 hover:text-white/80 hover:bg-white/10
								transition-colors
							"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						{/* Type badge */}
						<div className="flex items-center gap-2 mb-4">
							<span
								className="px-2.5 py-0.5 text-xs font-medium rounded-full uppercase tracking-wider"
								style={{
									backgroundColor: accentColor + "20",
									color: accentColor,
								}}
							>
								{node.type}
							</span>
							{node.date && (
								<span className="text-white/25 text-xs">
									{new Date(node.date).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							)}
						</div>

						{/* Title */}
						<h2 className="text-2xl font-bold text-white/90 mb-2">
							{node.title}
						</h2>

						{/* Description */}
						<p className="text-white/40 text-sm mb-6">
							{node.description}
						</p>

						{/* Tags */}
						{node.tags && node.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-8">
								{node.tags.map((tag) => (
									<span
										key={tag}
										className="px-2 py-0.5 text-xs rounded-md bg-white/5 border border-white/10 text-white/40"
									>
										{tag}
									</span>
								))}
							</div>
						)}

						{/* External link */}
						{node.link && node.link !== "#" && (
							<a
								href={node.link}
								target="_blank"
								rel="noopener noreferrer"
								className="
									inline-flex items-center gap-2 px-4 py-2 mb-8
									rounded-lg bg-white/5 border border-white/10
									text-white/60 text-sm
									hover:bg-white/10 hover:text-white/80
									transition-colors
								"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
								View Project
							</a>
						)}

						{/* Divider */}
						<div className="h-px bg-white/[0.06] mb-8" />

						{/* Markdown content */}
						{node.content && (
							<div className="prose-custom">
								<Markdown>{node.content}</Markdown>
							</div>
						)}

						{/* No content fallback */}
						{!node.content && (
							<p className="text-white/20 text-sm italic">
								Content coming soon...
							</p>
						)}
					</div>
				)}
			</div>
		</>
	)
}
