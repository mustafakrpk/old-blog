"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
	listMyWorkspaces,
	setActiveWorkspace,
	createWorkspace,
} from "@/actions/workspace"

interface WS {
	id: string
	name: string
	slug: string
	role: string
	active: boolean
}

export default function WorkspaceSwitcher() {
	const router = useRouter()
	const [list, setList] = useState<WS[]>([])
	const [open, setOpen] = useState(false)
	const [pending, startTransition] = useTransition()

	useEffect(() => {
		listMyWorkspaces()
			.then(setList)
			.catch(() => {})
	}, [])

	const active = list.find((w) => w.active) ?? list[0]

	function switchTo(id: string) {
		setOpen(false)
		startTransition(async () => {
			await setActiveWorkspace(id)
			router.refresh()
		})
	}

	function create() {
		const name = window.prompt("Yeni workspace adı:")
		if (!name?.trim()) return
		startTransition(async () => {
			await createWorkspace(name)
			router.refresh()
			const fresh = await listMyWorkspaces()
			setList(fresh)
			setOpen(false)
		})
	}

	return (
		<div className="relative px-3 py-4 border-b border-white/[0.06]">
			<button
				onClick={() => setOpen((o) => !o)}
				disabled={pending}
				className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/[0.05] transition-colors"
			>
				<span className="flex items-center gap-2 min-w-0">
					<span className="w-6 h-6 rounded-md bg-purple-500/30 flex items-center justify-center text-xs flex-shrink-0">
						{(active?.name ?? "?").charAt(0).toUpperCase()}
					</span>
					<span className="text-white/80 text-sm font-medium truncate">
						{active?.name ?? "…"}
					</span>
				</span>
				<svg
					className="w-4 h-4 text-white/30 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M8 9l4-4 4 4m0 6l-4 4-4-4"
					/>
				</svg>
			</button>

			{open && (
				<div className="absolute left-3 right-3 mt-1 z-50 bg-[#0a0a18] border border-white/[0.1] rounded-lg shadow-xl py-1">
					{list.map((w) => (
						<button
							key={w.id}
							onClick={() => switchTo(w.id)}
							className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-white/[0.06] ${
								w.active ? "text-white/90" : "text-white/55"
							}`}
						>
							<span className="truncate">{w.name}</span>
							{w.active && <span className="text-purple-300 text-xs">✓</span>}
						</button>
					))}
					<button
						onClick={create}
						className="w-full text-left px-3 py-2 text-sm text-white/45 hover:text-white/80 hover:bg-white/[0.06] border-t border-white/[0.06] mt-1"
					>
						+ Yeni workspace
					</button>
				</div>
			)}
		</div>
	)
}
