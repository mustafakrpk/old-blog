import { getFounderMetrics } from "@/actions/metrics"

export const dynamic = "force-dynamic"

function Stat({
	label,
	value,
	hint,
}: {
	label: string
	value: number | string
	hint?: string
}) {
	return (
		<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
			<p className="text-white/30 text-xs font-medium uppercase tracking-wider">
				{label}
			</p>
			<p className="text-3xl font-bold text-white/90 mt-1">{value}</p>
			{hint && <p className="text-white/30 text-xs mt-1">{hint}</p>}
		</div>
	)
}

export default async function MetricsPage() {
	let m
	try {
		m = await getFounderMetrics()
	} catch (e) {
		const code = e instanceof Error ? e.message : ""
		return (
			<div className="p-8 max-w-2xl">
				<h1 className="text-2xl font-bold text-white/90 mb-1">Metrics</h1>
				<p className="text-white/40 text-sm mt-4 bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
					{code === "NO_FOUNDER_EMAIL"
						? "Set FOUNDER_EMAIL in the server env to your account email, then reload."
						: "Not authorized — this page is for the founder account only."}
				</p>
			</div>
		)
	}

	const actRate =
		m.totalWorkspaces > 0
			? Math.round((m.activated / m.totalWorkspaces) * 100)
			: 0
	const pubRate =
		m.totalWorkspaces > 0
			? Math.round((m.published / m.totalWorkspaces) * 100)
			: 0
	const maxSignup = Math.max(1, ...m.signups.map((s) => s.count))

	return (
		<div className="p-8 max-w-4xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Metrics</h1>
			<p className="text-white/30 text-sm mb-8">Platform overview (founder)</p>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
				<Stat label="Users" value={m.totalUsers} hint={`+${m.newUsers7d} this week`} />
				<Stat
					label="Activated"
					value={m.activated}
					hint={`${actRate}% · ≥5 nodes`}
				/>
				<Stat
					label="Published"
					value={m.published}
					hint={`${pubRate}% · listed galaxies`}
				/>
				<Stat
					label="Go Pro clicks"
					value={m.proClicks}
					hint="payment intent"
				/>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
				<Stat label="Workspaces" value={m.totalWorkspaces} />
				<Stat label="Total nodes" value={m.totalNodes} />
				<Stat label="Follows" value={m.totalFollows} />
				<Stat label="Galaxy views" value={m.totalViews} />
			</div>

			{/* Signups chart */}
			<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5 mb-8">
				<p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">
					Signups · last 14 days
				</p>
				<div className="flex items-end gap-1.5 h-32">
					{m.signups.map((s) => (
						<div
							key={s.date}
							className="flex-1 flex flex-col items-center justify-end gap-1.5 group"
						>
							<span className="text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
								{s.count}
							</span>
							<div
								className="w-full rounded-t bg-purple-500/50 group-hover:bg-purple-400/70 transition-colors"
								style={{ height: `${(s.count / maxSignup) * 100}%`, minHeight: 2 }}
							/>
							<span className="text-[9px] text-white/25">{s.date.slice(5)}</span>
						</div>
					))}
				</div>
			</div>

			{/* Recent signups */}
			<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
				<p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
					Recent signups
				</p>
				<div className="space-y-1.5">
					{m.recent.map((u, i) => (
						<div
							key={i}
							className="flex items-center justify-between text-sm py-1"
						>
							<span className="text-white/80 truncate">
								{u.name}{" "}
								<span className="text-white/30">· {u.email}</span>
							</span>
							<span className="text-white/30 text-xs whitespace-nowrap ml-3">
								{new Date(u.createdAt).toISOString().slice(0, 10)}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
