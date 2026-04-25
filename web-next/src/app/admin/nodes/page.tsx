import Link from "next/link"
import { getNodesList } from "@/actions/admin"
import NodeFilters from "./node-filters"
import NodesTable from "./nodes-table"

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

			<NodesTable nodes={nodesList} />
		</div>
	)
}
