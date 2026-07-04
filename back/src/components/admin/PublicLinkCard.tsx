"use client"

import { useState, useEffect } from "react"

export default function PublicLinkCard({ slug }: { slug: string }) {
	const [origin, setOrigin] = useState("")
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		setOrigin(window.location.origin)
	}, [])

	const url = `${origin}/u/${slug}`

	async function copy() {
		await navigator.clipboard.writeText(url)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5 mb-8">
			<p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-2">
				Your public galaxy
			</p>
			<div className="flex items-center gap-2">
				<code className="flex-1 truncate text-sm text-purple-300/90 bg-black/30 rounded-lg px-3 py-2 border border-white/[0.06]">
					{origin ? url : `…/u/${slug}`}
				</code>
				<button
					onClick={copy}
					className="px-3 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-medium transition-colors whitespace-nowrap"
				>
					{copied ? "Copied ✓" : "Copy"}
				</button>
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-medium transition-colors whitespace-nowrap"
				>
					Open ↗
				</a>
			</div>
		</div>
	)
}
