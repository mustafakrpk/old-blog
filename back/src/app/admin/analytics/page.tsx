import Link from "next/link"
import { getAnalytics } from "@/actions/admin"
import { PRO_PRICE_LABEL } from "@/lib/plan"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
	const a = await getAnalytics()

	if (a.locked) {
		return (
			<div className="p-8 max-w-2xl">
				<h1 className="text-2xl font-bold text-white/90 mb-1">Analytics</h1>
				<p className="text-white/30 text-sm mb-6">Visitor statistics</p>
				<div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-8 text-center">
					<div className="text-4xl mb-3">📊</div>
					<h2 className="text-lg font-semibold text-white/85">
						Analytics is a Pro feature
					</h2>
					<p className="text-white/45 text-sm mt-1 mb-5">
						See how many people explore your galaxy. Unlock with {PRO_PRICE_LABEL}.
					</p>
					<Link
						href="/admin/billing"
						className="inline-block px-5 py-2.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/45 text-purple-100 text-sm font-semibold transition-colors"
					>
						Upgrade to Pro
					</Link>
				</div>
			</div>
		)
	}

	const max = Math.max(1, ...a.days.map((d) => d.count))

	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Analytics</h1>
			<p className="text-white/30 text-sm mb-8">Visits to your public galaxy</p>

			<div className="grid grid-cols-2 gap-4 mb-8">
				<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/30 text-xs font-medium uppercase tracking-wider">
						Total visits
					</p>
					<p className="text-3xl font-bold text-white/90 mt-1">{a.total}</p>
				</div>
				<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/30 text-xs font-medium uppercase tracking-wider">
						Last 7 days
					</p>
					<p className="text-3xl font-bold text-white/90 mt-1">{a.last7}</p>
				</div>
			</div>

			<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
				<p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">
					Last 14 days
				</p>
				<div className="flex items-end gap-1.5 h-40">
					{a.days.map((d) => (
						<div
							key={d.date}
							className="flex-1 flex flex-col items-center justify-end gap-1.5 group"
						>
							<span className="text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
								{d.count}
							</span>
							<div
								className="w-full rounded-t bg-purple-500/50 group-hover:bg-purple-400/70 transition-colors"
								style={{ height: `${(d.count / max) * 100}%`, minHeight: 2 }}
							/>
							<span className="text-[9px] text-white/25">
								{d.date.slice(5)}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
