"use client"

import { useState, useTransition } from "react"
import { createCheckoutSession, createPortalSession } from "@/actions/billing"
import { trackEvent } from "@/actions/metrics"
import { PRO_PRICE_LABEL, PRO_PERKS, isPaid } from "@/lib/plan"

export default function BillingClient({
	plan,
	billingEnabled,
	success,
}: {
	plan: string
	billingEnabled: boolean
	success: boolean
}) {
	const [pending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [interest, setInterest] = useState(false)
	const paid = isPaid(plan)

	function go(action: () => Promise<string>) {
		setError(null)
		startTransition(async () => {
			try {
				const url = await action()
				window.location.href = url
			} catch {
				setError("Action failed. Stripe may not be configured.")
			}
		})
	}

	// Ödeme niyetini her zaman kaydet (Stripe canlı değilken bile).
	function handleUpgrade() {
		trackEvent("pro_click").catch(() => {})
		if (billingEnabled) {
			go(createCheckoutSession)
		} else {
			setInterest(true)
		}
	}

	return (
		<div className="space-y-6 max-w-xl">
			{success && (
				<div className="rounded-lg bg-green-500/15 border border-green-500/25 px-4 py-3 text-green-200 text-sm">
					✓ Your Pro subscription is active! Thank you 🎉
				</div>
			)}

			<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-6">
				<div className="flex items-center justify-between mb-1">
					<span className="text-white/40 text-xs uppercase tracking-wider">
						Current plan
					</span>
					<span
						className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
							paid
								? "bg-purple-500/20 text-purple-200"
								: "bg-white/[0.08] text-white/60"
						}`}
					>
						{paid ? "PRO" : "FREE"}
					</span>
				</div>

				{!paid && (
					<>
						<p className="text-white/85 text-lg font-semibold mt-3">
							Upgrade to Pro — {PRO_PRICE_LABEL}
						</p>
						<ul className="mt-3 space-y-1.5">
							{PRO_PERKS.map((perk) => (
								<li
									key={perk}
									className="flex items-center gap-2 text-white/60 text-sm"
								>
									<span className="text-purple-300">✓</span>
									{perk}
								</li>
							))}
						</ul>
						<button
							onClick={handleUpgrade}
							disabled={pending}
							className="mt-5 w-full py-2.5 rounded-xl bg-purple-500/25 hover:bg-purple-500/35 disabled:opacity-40 disabled:cursor-not-allowed text-purple-100 text-sm font-semibold transition-colors"
						>
							{pending ? "Redirecting…" : `Upgrade to Pro — ${PRO_PRICE_LABEL}`}
						</button>
						{interest ? (
							<p className="text-green-300/90 text-xs mt-2 text-center">
								Thanks! We noted your interest — payments open very soon 🎉
							</p>
						) : (
							!billingEnabled && (
								<p className="text-white/30 text-xs mt-2 text-center">
									Payments open soon — click above to get notified.
								</p>
							)
						)}
					</>
				)}

				{paid && (
					<>
						<p className="text-white/70 text-sm mt-3">
							Your Pro subscription is active. All features unlocked.
						</p>
						<button
							onClick={() => go(createPortalSession)}
							disabled={pending || !billingEnabled}
							className="mt-4 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 text-white/80 text-sm font-medium transition-colors"
						>
							{pending ? "Opening…" : "Manage subscription"}
						</button>
					</>
				)}

				{error && <p className="text-red-400 text-sm mt-3">{error}</p>}
			</div>
		</div>
	)
}
