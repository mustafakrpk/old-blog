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
				setMsg("Kaydedildi. DNS + SSL kurulumunu tamamla.")
				router.refresh()
			} catch (e) {
				const code = e instanceof Error ? e.message : ""
				setMsg(
					code === "DOMAIN_TAKEN"
						? "Bu domain başka bir workspace'te kullanılıyor."
						: code === "INVALID_DOMAIN"
							? "Geçerli bir domain gir (örn. notlar.site.com)."
							: "Kaydedilemedi.",
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
				<span className="text-white/80 text-sm font-semibold">Özel domain</span>
				{!paid && (
					<span className="text-[10px] text-purple-300/80">🔒 Pro</span>
				)}
			</div>
			<p className="text-white/40 text-xs mb-4">
				Galaksini kendi domaininde yayınla (örn. notlar.site.com).
			</p>

			{!paid ? (
				<Link
					href="#"
					className="text-purple-300 text-sm underline"
				>
					Pro&apos;ya geçince açılır
				</Link>
			) : (
				<>
					<div className="flex gap-2">
						<input
							value={domain}
							onChange={(e) => setDomain(e.target.value)}
							placeholder="notlar.site.com"
							className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm outline-none focus:border-white/15 placeholder-white/20"
						/>
						<button
							onClick={save}
							disabled={busy || !domain}
							className="px-4 py-2 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 disabled:opacity-40 text-purple-100 text-sm font-medium"
						>
							Kaydet
						</button>
						{current && (
							<button
								onClick={remove}
								disabled={busy}
								className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/50 text-sm"
							>
								Kaldır
							</button>
						)}
					</div>

					{msg && <p className="text-white/60 text-xs mt-2">{msg}</p>}

					<div className="mt-4 text-xs text-white/35 leading-relaxed border-t border-white/[0.06] pt-3">
						<p className="text-white/50 mb-1">Kurulum:</p>
						<p>
							1) DNS'te <code className="text-purple-300/80">CNAME</code> ekle:{" "}
							<code className="text-white/60">{domain || "domain"}</code> →{" "}
							<code className="text-white/60">admin.mustafakırpık.com</code>
						</p>
						<p>
							2) SSL sertifikası için site yöneticisi domaini sunucuya tanımlar.
						</p>
					</div>
				</>
			)}
		</div>
	)
}
