import { getDashboardStats } from "@/actions/admin"
import { TYPE_COLORS } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
	const stats = await getDashboardStats()

	return (
		<div className="p-8 max-w-5xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Dashboard</h1>
			<p className="text-white/30 text-sm mb-8">Overview of your knowledge graph</p>

			{/* Summary cards */}
			<div className="grid grid-cols-2 gap-4 mb-8">
				<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/30 text-xs font-medium uppercase tracking-wider">Total Nodes</p>
					<p className="text-3xl font-bold text-white/90 mt-1">{stats.nodeCount}</p>
				</div>
				<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/30 text-xs font-medium uppercase tracking-wider">Total Links</p>
					<p className="text-3xl font-bold text-white/90 mt-1">{stats.linkCount}</p>
				</div>
			</div>

			{/* Breakdowns */}
			<div className="grid grid-cols-3 gap-4">
				{/* By Type */}
				<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">By Type</p>
					<div className="space-y-2">
						{stats.byType.map((item) => (
							<div key={item.type} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span
										className="w-2 h-2 rounded-full"
										style={{ backgroundColor: TYPE_COLORS[item.type] || "#fff" }}
									/>
									<span className="text-white/60 text-sm">{item.type}</span>
								</div>
								<span className="text-white/40 text-sm font-mono">{item.count}</span>
							</div>
						))}
					</div>
				</div>

				{/* By Cluster */}
				<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">By Cluster</p>
					<div className="space-y-2">
						{stats.byCluster.map((item) => (
							<div key={item.cluster} className="flex items-center justify-between">
								<span className="text-white/60 text-sm">{item.cluster}</span>
								<span className="text-white/40 text-sm font-mono">{item.count}</span>
							</div>
						))}
					</div>
				</div>

				{/* By Visibility */}
				<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">By Visibility</p>
					<div className="space-y-2">
						{stats.byVisibility.map((item) => (
							<div key={item.visibility} className="flex items-center justify-between">
								<span className="text-white/60 text-sm">{item.visibility}</span>
								<span className="text-white/40 text-sm font-mono">{item.count}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
