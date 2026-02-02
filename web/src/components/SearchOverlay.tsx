import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { contentNodes, TYPE_COLORS } from "../data/contentData"

interface SearchOverlayProps {
	onSelectNode: (nodeId: string) => void
}

export default function SearchOverlay({ onSelectNode }: SearchOverlayProps) {
	const [query, setQuery] = useState("")
	const [isFocused, setIsFocused] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const filteredNodes = useMemo(() => {
		if (!query.trim()) return []
		const q = query.toLowerCase()
		return contentNodes
			.filter(
				(n) =>
					n.title.toLowerCase().includes(q) ||
					n.description.toLowerCase().includes(q) ||
					n.tags?.some((t) => t.toLowerCase().includes(q)),
			)
			.slice(0, 8)
	}, [query])

	const showResults = isFocused && filteredNodes.length > 0

	const handleSelect = useCallback(
		(nodeId: string) => {
			const node = contentNodes.find((n) => n.id === nodeId)
			if (node) setQuery(node.title)
			setIsFocused(false)
			onSelectNode(nodeId)
		},
		[onSelectNode],
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && filteredNodes.length > 0) {
				handleSelect(filteredNodes[0].id)
			}
			if (e.key === "Escape") {
				setIsFocused(false)
				inputRef.current?.blur()
			}
		},
		[filteredNodes, handleSelect],
	)

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsFocused(false)
			}
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [])

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (
				e.key === "/" &&
				!e.ctrlKey &&
				!e.metaKey &&
				document.activeElement?.tagName !== "INPUT"
			) {
				e.preventDefault()
				inputRef.current?.focus()
			}
		}
		document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	}, [])

	return (
		<div
			ref={containerRef}
			className="fixed top-[12%] left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4"
		>
			{/* Search container */}
			<div
				className={`
					relative backdrop-blur-2xl rounded-2xl
					border transition-all duration-300
					${
						isFocused
							? "bg-white/[0.08] border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
							: "bg-white/[0.05] border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
					}
				`}
			>
				{/* Input row */}
				<div className="flex items-center px-5 py-3.5">
					<svg
						className="w-4 h-4 text-white/40 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>

					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onKeyDown={handleKeyDown}
						placeholder="Search posts, projects, skills..."
						className="
							flex-1 ml-3 bg-transparent outline-none
							text-white/90 text-sm placeholder-white/30
							caret-white/60
						"
						autoComplete="off"
						spellCheck={false}
					/>

					{!isFocused && !query && (
						<kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-white/25 border border-white/10 rounded-md bg-white/5">
							/
						</kbd>
					)}

					{query && (
						<button
							onClick={() => {
								setQuery("")
								inputRef.current?.focus()
							}}
							className="ml-2 text-white/30 hover:text-white/60 transition-colors"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}
				</div>

				{/* Results dropdown */}
				{showResults && (
					<div className="border-t border-white/10 px-2 py-2 max-h-72 overflow-y-auto">
						{filteredNodes.map((node) => {
							const color = TYPE_COLORS[node.type]
							return (
								<button
									key={node.id}
									onClick={() => handleSelect(node.id)}
									className="
										w-full flex items-center gap-3 px-3 py-2.5
										rounded-xl text-left
										hover:bg-white/[0.08] transition-colors
									"
								>
									<span
										className="w-2 h-2 rounded-full flex-shrink-0"
										style={{ backgroundColor: color }}
									/>
									<div className="flex-1 min-w-0">
										<span className="text-white/80 text-sm font-medium block truncate">
											{node.title}
										</span>
										<span className="text-white/30 text-xs truncate block">
											{node.description}
										</span>
									</div>
									<span
										className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
										style={{
											backgroundColor: color + "18",
											color: color,
										}}
									>
										{node.type}
									</span>
								</button>
							)
						})}
					</div>
				)}
			</div>

			{/* Hint */}
			{!isFocused && !query && (
				<p className="text-center text-white/15 text-xs mt-3 select-none">
					Click a node or search to explore
				</p>
			)}
		</div>
	)
}
