import { useEffect, useRef, useState, useCallback } from "react"
import Markdown from "react-markdown"
import { TYPE_COLORS, type ContentNode } from "../data/contentData"

type Phase = "idle" | "entering" | "open" | "exiting"

interface MaterializeOverlayProps {
	node: ContentNode | null
	originPos: { x: number; y: number } | null
	onClose: () => void
}

export default function MaterializeOverlay({
	node,
	originPos,
	onClose,
}: MaterializeOverlayProps) {
	const [phase, setPhase] = useState<Phase>("idle")
	const [displayedNode, setDisplayedNode] = useState<ContentNode | null>(null)
	const [displayedOrigin, setDisplayedOrigin] = useState<{
		x: number
		y: number
	}>({ x: 0, y: 0 })
	const contentRef = useRef<HTMLDivElement>(null)
	const scrollRef = useRef<HTMLDivElement>(null)

	// Open trigger
	useEffect(() => {
		if (node && phase === "idle") {
			setDisplayedNode(node)
			setDisplayedOrigin(
				originPos ?? {
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
				},
			)
			setPhase("entering")

			const timer = setTimeout(() => setPhase("open"), 1300)
			return () => clearTimeout(timer)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [node])

	// Close handler
	const handleClose = useCallback(() => {
		if (phase === "entering" || phase === "open") {
			setPhase("exiting")
			setTimeout(() => {
				setPhase("idle")
				setDisplayedNode(null)
				onClose()
			}, 600)
		}
	}, [phase, onClose])

	// When parent sets node to null externally
	useEffect(() => {
		if (!node && phase !== "idle" && phase !== "exiting") {
			handleClose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [node])

	// Escape key
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleClose()
		}
		if (phase !== "idle") {
			document.addEventListener("keydown", handler)
		}
		return () => document.removeEventListener("keydown", handler)
	}, [phase, handleClose])

	// Click outside content area
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				contentRef.current &&
				!contentRef.current.contains(e.target as Node)
			) {
				handleClose()
			}
		}
		if (phase === "open") {
			const timer = setTimeout(() => {
				document.addEventListener("mousedown", handler)
			}, 100)
			return () => {
				clearTimeout(timer)
				document.removeEventListener("mousedown", handler)
			}
		}
	}, [phase, handleClose])

	// Scroll to top on new node
	useEffect(() => {
		if (phase === "entering" && scrollRef.current) {
			scrollRef.current.scrollTop = 0
		}
	}, [phase])

	if (phase === "idle" || !displayedNode) return null

	const accentColor = TYPE_COLORS[displayedNode.type] || "#fff"
	const isExiting = phase === "exiting"
	const exitClass = isExiting ? "dm-exit" : ""

	const cssVars = {
		"--dm-origin-x": `${displayedOrigin.x}px`,
		"--dm-origin-y": `${displayedOrigin.y}px`,
		"--dm-accent": accentColor,
	} as React.CSSProperties

	return (
		<>
			{/* Layer 1: Blur on graph */}
			<div className={`dm-blur-backdrop ${exitClass}`} style={cssVars} />

			{/* Layer 2: Radial vignette with glow pulse */}
			<div className={`dm-vignette ${exitClass}`} style={cssVars} />

			{/* Layer 3: Expanding circle + content */}
			<div
				ref={scrollRef}
				className={`dm-circle ${exitClass}`}
				style={cssVars}
			>
				{/* Content wrapper */}
				<div
					ref={contentRef}
					className="relative max-w-2xl mx-auto px-4 sm:px-8 py-16 min-h-screen flex flex-col justify-start"
					style={{ paddingTop: "12vh" }}
				>
					{/* Close button */}
					<button
						onClick={handleClose}
						className={`dm-content-item ${exitClass} fixed top-6 right-6 z-[60]
							w-10 h-10 flex items-center justify-center
							rounded-full bg-white/5 border border-white/10
							text-white/40 hover:text-white/80 hover:bg-white/10 hover:border-white/20
							transition-colors`}
						style={{ animationDelay: "750ms" }}
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

					{/* Type badge + date */}
					<div
						className={`dm-content-item ${exitClass} flex items-center gap-3 mb-5`}
						style={{ animationDelay: "800ms" }}
					>
						<span
							className="px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-widest"
							style={{
								backgroundColor: accentColor + "20",
								color: accentColor,
								boxShadow: `0 0 20px ${accentColor}30`,
							}}
						>
							{displayedNode.type}
						</span>
						{displayedNode.date && (
							<span className="text-white/25 text-xs font-mono tracking-wider">
								{new Date(
									displayedNode.date,
								).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						)}
					</div>

					{/* Title */}
					<h2
						className={`dm-content-item ${exitClass} text-3xl md:text-4xl font-bold text-white/95 mb-3 leading-tight`}
						style={{ animationDelay: "880ms" }}
					>
						{displayedNode.title}
					</h2>

					{/* Description */}
					<p
						className={`dm-content-item ${exitClass} text-white/40 text-base mb-6 leading-relaxed`}
						style={{ animationDelay: "960ms" }}
					>
						{displayedNode.description}
					</p>

					{/* Tags */}
					{displayedNode.tags && displayedNode.tags.length > 0 && (
						<div
							className={`dm-content-item ${exitClass} flex flex-wrap gap-2 mb-8`}
							style={{ animationDelay: "1040ms" }}
						>
							{displayedNode.tags.map((tag) => (
								<span
									key={tag}
									className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40
										hover:bg-white/[0.08] hover:text-white/60 transition-colors"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					{/* External link */}
					{displayedNode.link && displayedNode.link !== "#" && (
						<a
							href={displayedNode.link}
							target="_blank"
							rel="noopener noreferrer"
							className={`dm-content-item ${exitClass} inline-flex items-center gap-2 px-4 py-2.5 mb-8
								rounded-xl bg-white/5 border border-white/10
								text-white/60 text-sm hover:bg-white/10 hover:text-white/80 transition-colors`}
							style={{ animationDelay: "1100ms" }}
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
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
							View Project
						</a>
					)}

					{/* Animated divider */}
					<div
						className={`dm-content-item ${exitClass} h-px mb-8`}
						style={{
							animationDelay: "1140ms",
							background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
						}}
					/>

					{/* Markdown body */}
					{displayedNode.content && (
						<div
							className={`dm-content-item ${exitClass}`}
							style={{ animationDelay: "1200ms" }}
						>
							<div className="prose-custom">
								<Markdown>{displayedNode.content}</Markdown>
							</div>
						</div>
					)}

					{!displayedNode.content && (
						<p
							className={`dm-content-item ${exitClass} text-white/20 text-sm italic`}
							style={{ animationDelay: "1200ms" }}
						>
							Content coming soon...
						</p>
					)}

					{/* Bottom spacer */}
					<div className="h-24" />
				</div>
			</div>
		</>
	)
}
