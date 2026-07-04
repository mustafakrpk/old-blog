"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { setCustomDomain, removeCustomDomain } from "@/actions/admin"
import { isPaid } from "@/lib/plan"

export default function CustomDomainCard({
	plan,
	current,
}: {
	plan: string
	current: string | null
}) {
	const router = useRouter()
	const [domain, setDomain] = useState(current ?? "")
	const [busy, startTransition] = useTransition()
	const [msg, setMsg] = useState<string | null>(null)
	const paid = isPaid(plan)

	function save() {
		setMsg(null)
		startTransition(async () => {
			try {
				await setCustomDomain(domain)
				setMsg("Saved. Complete the DNS + SSL setup.")
				router.refresh()
			} catch (e) {
				const code = e instanceof Error ? e.message : ""
				setMsg(
					code === "DOMAIN_TAKEN"
						? "This domain is already in use by another workspace."
						: code === "INVALID_DOMAIN"
							? "Enter a valid domain (e.g. notes.site.com)."
							: "Could not save.",
				)
			}
		})
	}

	function remove() {
		startTransition(async () => {
			await removeCustomDomain()
			setDomain("")
			setMsg(null)
			router.refresh()
		})
	}

	return (
		<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-6">
			<div className="flex items-center justify-between mb-1">
				<span className="text-white/80 text-sm font-semibold">Custom domain</span>
				{!paid && (
					<span className="text-[10px] text-purple-300/80">🔒 Pro</span>
				)}
			</div>
			<p className="text-white/40 text-xs mb-4">
				Publish your galaxy on your own domain (e.g. notes.site.com).
			</p>

			{!paid ? (
				<Link
					href="#"
					className="text-purple-300 text-sm underline"
				>
					Unlocks when you upgrade to Pro
				</Link>
			) : (
				<>
					<div className="flex gap-2">
						<input
							value={domain}
							onChange={(e) => setDomain(e.target.value)}
							placeholder="notes.site.com"
							className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm outline-none focus:border-white/15 placeholder-white/20"
						/>
						<button
							onClick={save}
							disabled={busy || !domain}
							className="px-4 py-2 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 disabled:opacity-40 text-purple-100 text-sm font-medium"
						>
							Save
						</button>
						{current && (
							<button
								onClick={remove}
								disabled={busy}
								className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/50 text-sm"
							>
								Remove
							</button>
						)}
					</div>

					{msg && <p className="text-white/60 text-xs mt-2">{msg}</p>}

					<div className="mt-4 text-xs text-white/35 leading-relaxed border-t border-white/[0.06] pt-3">
						<p className="text-white/50 mb-1">Setup:</p>
						<p>
							1) Add a <code className="text-purple-300/80">CNAME</code> in DNS:{" "}
							<code className="text-white/60">{domain || "domain"}</code> →{" "}
							<code className="text-white/60">admin.mustafakırpık.com</code>
						</p>
						<p>
							2) For the SSL certificate, the site admin registers the domain on the server.
						</p>
					</div>
				</>
			)}
		</div>
	)
}
