"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createNode } from "@/actions/admin"
import NodeForm from "../node-form"

export default function NewNodePage() {
	const router = useRouter()
	const [saving, setSaving] = useState(false)

	async function handleSave(data: Parameters<typeof createNode>[0]) {
		setSaving(true)
		try {
			await createNode(data)
			router.push("/admin/nodes")
		} catch (err) {
			console.error("Failed to create node:", err)
			setSaving(false)
		}
	}

	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">New Node</h1>
			<p className="text-white/30 text-sm mb-6">Add a new node to your knowledge graph</p>

			<NodeForm onSave={handleSave} saving={saving} />
		</div>
	)
}
