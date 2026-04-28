"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import {
	getNodeLinks,
	getAllNodeTitles,
	createLink,
	deleteLink,
} from "@/actions/admin"
import { TYPE_COLORS } from "@/lib/constants"

interface NodeLinksProps {
	nodeId: string
}

interface OutgoingLink {
	source: string
	target: string
	targetTitle: string
	targetType: string
}

interface IncomingLink {
	source: string
	target: string
	sourceTitle: string
	sourceType: string
}

interface NodeOption {
	id: string
	title: string
	type: string
}

export default function NodeLinks({ nodeId }: NodeLinksProps) {
	const [outgoing, setOutgoing] = useState<OutgoingLink[]>([])
	const [incoming, setIncoming] = useState<IncomingLink[]>([])
	const [allNodes, setAllNodes] = useState<NodeOption[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [selectedTargetId, setSelectedTargetId] = useState("")
	const [pending, startTransition] = useTransition()

	async function reload() {
		const [linksData, allData] = await Promise.all([
			getNodeLinks(nodeId),
			getAllNodeTitles(nodeId),
		])
		setOutgoing(linksData.outgoing)
		setIncoming(linksData.incoming)
		setAllNodes(allData)
		setLoading(false)
	}

	useEffect(() => {
		reload()
	}, [nodeId])

	// Mevcut outgoing target'ları filtrele (zaten eklenenleri seçilemez yap)
	const existingTargets = useMemo(
		() => new Set(outgoing.map((l) => l.target)),
		[outgoing],
	)

	const availableNodes = useMemo(() => {
		const q = search.toLowerCase().trim()
		return allNodes
			.filter((n) => !existingTargets.has(n.id))
			.filter(
				(n) =>
					!q ||
					n.title.toLowerCase().includes(q) ||
					n.id.toLowerCase().includes(q) ||
					n.type.toLowerCase().includes(q),
			)
			.slice(0, 50)
	}, [allNodes, search, existingTargets])

	function handleAdd() {
		if (!selectedTargetId) return
		startTransition(async () => {
			await createLink(nodeId, selectedTargetId)
			setSearch("")
			setSelectedTargetId("")
			await reload()
		})
	}

	function handleDeleteOutgoing(target: string) {
		startTransition(async () => {
			await deleteLink(nodeId, target)
			await reload()
		})
	}

	function handleDeleteIncoming(source: string) {
		startTransition(async () => {
			await deleteLink(source, nodeId)
			await reload()
		})
	}

	if (loading) {
		return (
			<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6">
				<p className="text-white/30 text-sm">Loading links...</p>
			</div>
		)
	}

	return (
		<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 space-y-5">
			<div className="flex items-center justify-between">
				<p className="text-white/50 text-xs font-medium uppercase tracking-wider">
					Links
				</p>
				<p className="text-white/30 text-xs">
					{outgoing.length} out · {incoming.length} in
				</p>
			</div>

			{/* Add new link */}
			<div className="space-y-2">
				<label className="block text-white/40 text-xs font-medium">
					Add outgoing link →
				</label>
				<div className="flex gap-2">
					<div className="flex-1 relative">
						<input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								setSelectedTargetId("")
							}}
							placeholder="Search node by title..."
							className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm outline-none focus:border-white/15 placeholder-white/20"
						/>
						{search && availableNodes.length > 0 && !selectedTargetId && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a14] border border-white/[0.1] rounded-lg max-h-64 overflow-y-auto z-10 shadow-xl">
								{availableNodes.map((n) => {
									const color = TYPE_COLORS[n.type] || "#fff"
									return (
										<button
											key={n.id}
											type="button"
											onClick={() => {
												setSelectedTargetId(n.id)
												setSearch(n.title)
											}}
											className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
										>
											<span
												className="w-2 h-2 rounded-full flex-shrink-0"
												style={{ backgroundColor: color }}
											/>
											<span className="text-white/80 text-sm flex-1 truncate">
												{n.title}
											</span>
											<span
												className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
												style={{
													backgroundColor: color + "18",
													color,
												}}
											>
												{n.type}
											</span>
										</button>
									)
								})}
							</div>
						)}
					</div>
					<button
						type="button"
						onClick={handleAdd}
						disabled={!selectedTargetId || pending}
						className="px-4 py-2 rounded-lg bg-white/[0.1] hover:bg-white/[0.15] disabled:opacity-40 disabled:cursor-not-allowed text-white/90 text-sm font-medium transition-colors"
					>
						{pending ? "..." : "Add"}
					</button>
				</div>
			</div>

			{/* Outgoing */}
			<div>
				<p className="text-white/40 text-xs font-medium mb-2">
					Outgoing → ({outgoing.length})
				</p>
				{outgoing.length === 0 ? (
					<p className="text-white/20 text-xs italic">No outgoing links</p>
				) : (
					<div className="space-y-1">
						{outgoing.map((link) => {
							const color = TYPE_COLORS[link.targetType] || "#fff"
							return (
								<div
									key={link.target}
									className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] group"
								>
									<span
										className="w-2 h-2 rounded-full flex-shrink-0"
										style={{ backgroundColor: color }}
									/>
									<span className="text-white/80 text-sm flex-1 truncate">
										{link.targetTitle}
									</span>
									<span
										className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
										style={{
											backgroundColor: color + "18",
											color,
										}}
									>
										{link.targetType}
									</span>
									<button
										type="button"
										onClick={() => handleDeleteOutgoing(link.target)}
										disabled={pending}
										className="text-white/30 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
									>
										✕
									</button>
								</div>
							)
						})}
					</div>
				)}
			</div>

			{/* Incoming */}
			<div>
				<p className="text-white/40 text-xs font-medium mb-2">
					Incoming ← ({incoming.length})
				</p>
				{incoming.length === 0 ? (
					<p className="text-white/20 text-xs italic">No incoming links</p>
				) : (
					<div className="space-y-1">
						{incoming.map((link) => {
							const color = TYPE_COLORS[link.sourceType] || "#fff"
							return (
								<div
									key={link.source}
									className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] group"
								>
									<span
										className="w-2 h-2 rounded-full flex-shrink-0"
										style={{ backgroundColor: color }}
									/>
									<span className="text-white/80 text-sm flex-1 truncate">
										{link.sourceTitle}
									</span>
									<span
										className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
										style={{
											backgroundColor: color + "18",
											color,
										}}
									>
										{link.sourceType}
									</span>
									<button
										type="button"
										onClick={() => handleDeleteIncoming(link.source)}
										disabled={pending}
										className="text-white/30 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
									>
										✕
									</button>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
