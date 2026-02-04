"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getNodeById, updateNode, deleteNode } from "@/actions/admin"
import type { Node } from "@/db/schema"
import NodeForm from "../node-form"

export default function EditNodePage() {
	const router = useRouter()
	const params = useParams()
	const nodeId = params.id as string

	const [node, setNode] = useState<Node | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		async function load() {
			const data = await getNodeById(nodeId)
			setNode(data)
			setLoading(false)
		}
		load()
	}, [nodeId])

	async function handleSave(data: Parameters<typeof updateNode>[1] & { id: string }) {
		setSaving(true)
		try {
			const { id: _, ...updateData } = data
			await updateNode(nodeId, updateData)
			router.push("/admin/nodes")
		} catch (err) {
			console.error("Failed to update node:", err)
			setSaving(false)
		}
	}

	async function handleDelete() {
		if (!confirm("Are you sure you want to delete this node?")) return
		setDeleting(true)
		try {
			await deleteNode(nodeId)
			router.push("/admin/nodes")
		} catch (err) {
			console.error("Failed to delete node:", err)
			setDeleting(false)
		}
	}

	if (loading) {
		return (
			<div className="p-8 flex items-center justify-center h-64">
				<p className="text-white/30 text-sm">Loading...</p>
			</div>
		)
	}

	if (!node) {
		return (
			<div className="p-8 flex items-center justify-center h-64">
				<p className="text-white/30 text-sm">Node not found</p>
			</div>
		)
	}

	return (
		<div className="p-8 max-w-3xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-white/90 mb-1">Edit Node</h1>
					<p className="text-white/30 text-sm font-mono">{node.id}</p>
				</div>
				<button
					onClick={handleDelete}
					disabled={deleting}
					className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors disabled:opacity-40"
				>
					{deleting ? "Deleting..." : "Delete Node"}
				</button>
			</div>

			<NodeForm initialData={node} onSave={handleSave} saving={saving} />
		</div>
	)
}
