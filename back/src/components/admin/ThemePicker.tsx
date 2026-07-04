"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { setTheme } from "@/actions/admin"
import { THEMES } from "@/lib/themes"
import { isPaid } from "@/lib/plan"

export default function ThemePicker({
	current,
	plan,
}: {
	current: string
	plan: string
}) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [selected, setSelected] = useState(current)
	const [locked, setLocked] = useState(false)
	const paid = isPaid(plan)

	function choose(key: string, free: boolean) {
		if (!free && !paid) {
			setLocked(true)
			return
		}
		setLocked(false)
		setSelected(key)
		startTransition(async () => {
			try {
				await setTheme(key)
				router.refresh()
			} catch {
				setSelected(current)
			}
		})
	}

	return (
		<div className="max-w-2xl">
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{THEMES.map((t) => {
					const isSel = selected === t.key
					const isLockedTheme = !t.free && !paid
					return (
						<button
							key={t.key}
							onClick={() => choose(t.key, t.free)}
							disabled={pending}
							className={`relative text-left rounded-xl p-4 border transition-all disabled:opacity-60 ${
								isSel
									? "border-purple-400/60 ring-1 ring-purple-400/40"
									: "border-white/[0.08] hover:border-white/20"
							}`}
							style={{ backgroundColor: t.bg }}
						>
							<div className="flex items-center gap-2 mb-6">
								<span
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: t.accent }}
								/>
								<span
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: "#ffffff" }}
								/>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-white/80 text-sm font-medium">
									{t.name}
								</span>
								{isLockedTheme && (
									<span className="text-[10px] text-purple-300/80">
										🔒 Pro
									</span>
								)}
								{isSel && !isLockedTheme && (
									<span className="text-[10px] text-purple-300">active ✓</span>
								)}
							</div>
						</button>
					)
				})}
			</div>

			{locked && (
				<div className="mt-4 rounded-lg bg-purple-500/15 border border-purple-400/25 px-4 py-3 text-sm text-purple-100">
					This theme is a Pro feature.{" "}
					<Link href="/admin/billing" className="underline font-medium">
						Upgrade to Pro
					</Link>{" "}
					to unlock all themes.
				</div>
			)}
		</div>
	)
}
