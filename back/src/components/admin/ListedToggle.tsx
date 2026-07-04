"use client"

import { useState, useTransition } from "react"
import { setListed } from "@/actions/admin"

export default function ListedToggle({ initial }: { initial: boolean }) {
	const [on, setOn] = useState(initial)
	const [pending, startTransition] = useTransition()

	function toggle() {
		const next = !on
		setOn(next)
		startTransition(async () => {
			try {
				await setListed(next)
			} catch {
				setOn(!next)
			}
		})
	}

	return (
		<div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
			<div>
				<p className="text-white/80 text-sm font-medium">List in Explore</p>
				<p className="text-white/35 text-xs mt-0.5">
					When on, your galaxy is visible to everyone on the /explore page.
				</p>
			</div>
			<button
				onClick={toggle}
				disabled={pending}
				className={`relative w-11 h-6 rounded-full transition-colors ${
					on ? "bg-purple-500/70" : "bg-white/[0.12]"
				} disabled:opacity-50`}
			>
				<span
					className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
						on ? "translate-x-5" : "translate-x-0.5"
					}`}
				/>
			</button>
		</div>
	)
}
