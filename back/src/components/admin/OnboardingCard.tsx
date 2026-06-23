"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { applyTemplate } from "@/actions/admin"
import { TEMPLATES } from "@/lib/templates"

export default function OnboardingCard() {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [active, setActive] = useState<string | null>(null)

	function choose(key: string) {
		setActive(key)
		startTransition(async () => {
			await applyTemplate(key)
			router.push("/admin/nodes")
		})
	}

	return (
		<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 mb-8">
			<h2 className="text-xl font-bold text-white/90">
				Galaksin henüz boş 🌌
			</h2>
			<p className="text-white/40 text-sm mt-1 mb-6">
				Bir şablonla başla — saniyeler içinde bağlantılı bir graph'ın olsun.
				İstediğin gibi düzenleyebilirsin.
			</p>

			<div className="grid grid-cols-2 gap-3">
				{TEMPLATES.map((t) => (
					<button
						key={t.key}
						onClick={() => choose(t.key)}
						disabled={pending}
						className="text-left p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
					>
						<div className="text-2xl mb-1">{t.emoji}</div>
						<div className="text-white/85 text-sm font-medium">
							{t.name}
							{pending && active === t.key && (
								<span className="text-white/40"> — ekleniyor…</span>
							)}
						</div>
						<div className="text-white/35 text-xs mt-0.5">
							{t.description}
						</div>
					</button>
				))}
			</div>

			<div className="mt-5 pt-5 border-t border-white/[0.06]">
				<a
					href="/admin/nodes/new"
					className="text-white/40 hover:text-white/70 text-sm transition-colors"
				>
					veya boş başla → ilk node'unu kendin oluştur
				</a>
			</div>
		</div>
	)
}
