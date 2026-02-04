"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"

const types = ["hub", "project", "skill", "blog", "note", "resource", "hobby", "dataset"]
const clusters = ["core", "career", "library", "playground", "life"]

interface NodeFiltersProps {
	currentType?: string
	currentCluster?: string
	currentSearch?: string
}

export default function NodeFilters({ currentType, currentCluster, currentSearch }: NodeFiltersProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [search, setSearch] = useState(currentSearch || "")

	const updateFilter = useCallback(
		(key: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString())
			if (value) {
				params.set(key, value)
			} else {
				params.delete(key)
			}
			router.push(`/admin/nodes?${params.toString()}`)
		},
		[router, searchParams],
	)

	const handleSearch = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()
			updateFilter("search", search)
		},
		[search, updateFilter],
	)

	return (
		<div className="flex flex-wrap items-center gap-3">
			{/* Search */}
			<form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search nodes..."
					className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/80 text-sm outline-none focus:border-white/15 placeholder-white/20 transition-colors"
				/>
			</form>

			{/* Type filter */}
			<select
				value={currentType || ""}
				onChange={(e) => updateFilter("type", e.target.value)}
				className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm outline-none cursor-pointer"
			>
				<option value="">All types</option>
				{types.map((t) => (
					<option key={t} value={t}>{t}</option>
				))}
			</select>

			{/* Cluster filter */}
			<select
				value={currentCluster || ""}
				onChange={(e) => updateFilter("cluster", e.target.value)}
				className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm outline-none cursor-pointer"
			>
				<option value="">All clusters</option>
				{clusters.map((c) => (
					<option key={c} value={c}>{c}</option>
				))}
			</select>

			{/* Clear filters */}
			{(currentType || currentCluster || currentSearch) && (
				<button
					onClick={() => router.push("/admin/nodes")}
					className="text-white/30 hover:text-white/60 text-xs transition-colors"
				>
					Clear
				</button>
			)}
		</div>
	)
}
