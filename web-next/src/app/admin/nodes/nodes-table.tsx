"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table"
import { TYPE_COLORS } from "@/lib/constants"
import type { Node } from "@/db/schema"

interface NodesTableProps {
	nodes: Node[]
}

export default function NodesTable({ nodes }: NodesTableProps) {
	const router = useRouter()
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "title", desc: false },
	])
	const [pageSize, setPageSize] = useState(25)

	const columns = useMemo<ColumnDef<Node>[]>(
		() => [
			{
				id: "dot",
				header: "",
				enableSorting: false,
				cell: ({ row }) => (
					<span
						className="inline-block w-2.5 h-2.5 rounded-full"
						style={{
							backgroundColor: TYPE_COLORS[row.original.type] || "#fff",
						}}
					/>
				),
			},
			{
				accessorKey: "title",
				header: "Title",
				cell: ({ row }) => (
					<span className="text-white/85 text-sm font-medium">
						{row.original.title}
					</span>
				),
			},
			{
				accessorKey: "type",
				header: "Type",
				cell: ({ row }) => {
					const color = TYPE_COLORS[row.original.type] || "#fff"
					return (
						<span
							className="text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider"
							style={{ backgroundColor: color + "18", color }}
						>
							{row.original.type}
						</span>
					)
				},
			},
			{
				accessorKey: "cluster",
				header: "Cluster",
				cell: ({ row }) => (
					<span className="text-white/50 text-xs">{row.original.cluster}</span>
				),
			},
			{
				accessorKey: "visibility",
				header: "Visibility",
				cell: ({ row }) => (
					<span className="text-white/50 text-xs">
						{row.original.visibility}
					</span>
				),
			},
		],
		[],
	)

	const table = useReactTable({
		data: nodes,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize: 25 } },
	})

	if (nodes.length === 0) {
		return (
			<div className="text-center py-12 text-white/20 text-sm">
				No nodes found
			</div>
		)
	}

	const pageIndex = table.getState().pagination.pageIndex
	const pageCount = table.getPageCount()
	const totalRows = table.getFilteredRowModel().rows.length
	const rangeStart = pageIndex * pageSize + 1
	const rangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows)

	return (
		<div className="mt-4">
			<div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
				<table className="w-full">
					<thead>
						{table.getHeaderGroups().map((hg) => (
							<tr key={hg.id} className="border-b border-white/[0.06]">
								{hg.headers.map((header) => {
									const canSort = header.column.getCanSort()
									const sortDir = header.column.getIsSorted()
									return (
										<th
											key={header.id}
											onClick={
												canSort
													? header.column.getToggleSortingHandler()
													: undefined
											}
											className={`text-left px-4 py-3 text-white/35 text-[11px] font-medium uppercase tracking-wider ${
												canSort
													? "cursor-pointer hover:text-white/60 transition-colors select-none"
													: ""
											}`}
										>
											<span className="inline-flex items-center gap-1.5">
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												{sortDir === "asc" && (
													<span className="text-white/40">▲</span>
												)}
												{sortDir === "desc" && (
													<span className="text-white/40">▼</span>
												)}
											</span>
										</th>
									)
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								onClick={() =>
									router.push(`/admin/nodes/${row.original.id}`)
								}
								className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] cursor-pointer transition-colors"
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-3 align-middle">
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between mt-4 text-xs">
				<div className="flex items-center gap-4 text-white/40">
					<span>
						{rangeStart}–{rangeEnd} / {totalRows}
					</span>
					<label className="flex items-center gap-2">
						<span>Rows:</span>
						<select
							value={pageSize}
							onChange={(e) => {
								const size = Number(e.target.value)
								setPageSize(size)
								table.setPageSize(size)
							}}
							className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/70 outline-none cursor-pointer"
						>
							{[10, 25, 50, 100].map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</label>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
						className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/70 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						«
					</button>
					<button
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/70 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						‹
					</button>
					<span className="px-2 text-white/50">
						{pageIndex + 1} / {pageCount}
					</span>
					<button
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/70 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						›
					</button>
					<button
						onClick={() => table.setPageIndex(pageCount - 1)}
						disabled={!table.getCanNextPage()}
						className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/70 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						»
					</button>
				</div>
			</div>
		</div>
	)
}
