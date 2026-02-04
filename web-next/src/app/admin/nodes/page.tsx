import Link from "next/link"
import { getNodesList } from "@/actions/admin"
import { TYPE_COLORS } from "@/lib/constants"
import NodeFilters from "./node-filters"

export const dynamic = "force-dynamic"

export default async function AdminNodesPage({
	searchParams,
}: {
	searchParams: Promise<{ type?: string; cluster?: string; search?: string }>
}) {
	const params = await searchParams
	const nodesList = await getNodesList({
		type: params.type,
		cluster: params.cluster,
		search: params.search,
	})

	return (
		<div className="p-8 max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-white/90 mb-1">Nodes</h1>
					<p className="text-white/30 text-sm">{nodesList.length} nodes</p>
				</div>
				<Link
					href="/admin/nodes/new"
					className="px-4 py-2 rounded-xl bg-white/[0.1] hover:bg-white/[0.15] text-white/90 text-sm font-medium transition-colors"
				>
					+ New Node
				</Link>
			</div>

			<NodeFilters
				currentType={params.type}
				currentCluster={params.cluster}
				currentSearch={params.search}
			/>

			{/* Node list */}
			<div className="space-y-2 mt-4">
				{nodesList.length === 0 ? (
					<div className="text-center py-12 text-white/20 text-sm">
						No nodes found
					</div>
				) : (
					nodesList.map((node) => {
						const color = TYPE_COLORS[node.type] || "#fff"
						return (
							<Link
								key={node.id}
								href={`/admin/nodes/${node.id}`}
								className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
							>
								<span
									className="w-2.5 h-2.5 rounded-full flex-shrink-0"
									style={{ backgroundColor: color }}
								/>
								<div className="flex-1 min-w-0">
									<span className="text-white/80 text-sm font-medium block truncate group-hover:text-white/95 transition-colors">
										{node.title}
									</span>
									<span className="text-white/25 text-xs">
										{node.cluster} · {node.visibility}
									</span>
								</div>
								<span
									className="text-[10px] px-2 py-0.5 rounded-md flex-shrink-0 uppercase font-bold tracking-wider"
									style={{ backgroundColor: color + "18", color }}
								>
									{node.type}
								</span>
								<svg className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
								</svg>
							</Link>
						)
					})
				)}
			</div>
		</div>
	)
}
