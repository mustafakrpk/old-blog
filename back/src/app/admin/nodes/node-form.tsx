"use client"

import { useState } from "react"
import type { Node } from "@/db/schema"

const nodeTypes = ["hub", "project", "skill", "blog", "note", "resource", "hobby", "dataset"] as const
const clusters = ["core", "career", "library", "playground", "life"] as const
const visibilities = ["professional", "explorer", "god_mode"] as const

interface NodeFormProps {
	initialData?: Node
	onSave: (data: {
		id: string
		title: string
		type: (typeof nodeTypes)[number]
		cluster: (typeof clusters)[number]
		visibility: (typeof visibilities)[number]
		val: number
		content: string | null
		meta: {
			description?: string
			date?: string
			tags?: string[]
			link?: string
			category?: string
		} | null
	}) => void
	saving?: boolean
}

export default function NodeForm({ initialData, onSave, saving }: NodeFormProps) {
	const [id, setId] = useState(initialData?.id || "")
	const [title, setTitle] = useState(initialData?.title || "")
	const [type, setType] = useState<(typeof nodeTypes)[number]>(initialData?.type || "note")
	const [cluster, setCluster] = useState<(typeof clusters)[number]>(initialData?.cluster || "core")
	const [visibility, setVisibility] = useState<(typeof visibilities)[number]>(initialData?.visibility || "professional")
	const [val, setVal] = useState(initialData?.val || 1)
	const [content, setContent] = useState(initialData?.content || "")
	const [description, setDescription] = useState((initialData?.meta as Record<string, string> | null)?.description || "")
	const [tags, setTags] = useState((initialData?.meta as Record<string, string[]> | null)?.tags?.join(", ") || "")
	const [link, setLink] = useState((initialData?.meta as Record<string, string> | null)?.link || "")
	const [category, setCategory] = useState((initialData?.meta as Record<string, string> | null)?.category || "")
	const [date, setDate] = useState((initialData?.meta as Record<string, string> | null)?.date || "")

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		onSave({
			id: id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
			title,
			type,
			cluster,
			visibility,
			val,
			content: content || null,
			meta: {
				...(description && { description }),
				...(date && { date }),
				...(tags && { tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }),
				...(link && { link }),
				...(category && { category }),
			},
		})
	}

	const inputClass = "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm outline-none focus:border-white/15 placeholder-white/20 transition-colors"
	const labelClass = "block text-white/40 text-xs font-medium mb-1.5"
	const selectClass = "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm outline-none cursor-pointer"

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 space-y-4">
				<p className="text-white/50 text-xs font-medium uppercase tracking-wider">Basic Info</p>

				{!initialData && (
					<div>
						<label className={labelClass}>ID (auto-generated if empty)</label>
						<input
							type="text"
							value={id}
							onChange={(e) => setId(e.target.value)}
							className={inputClass}
							placeholder="my-node-id"
						/>
					</div>
				)}

				<div>
					<label className={labelClass}>Title *</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className={inputClass}
						placeholder="Node title"
						required
					/>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<div>
						<label className={labelClass}>Type</label>
						<select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={selectClass}>
							{nodeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
						</select>
					</div>
					<div>
						<label className={labelClass}>Cluster</label>
						<select value={cluster} onChange={(e) => setCluster(e.target.value as typeof cluster)} className={selectClass}>
							{clusters.map((c) => <option key={c} value={c}>{c}</option>)}
						</select>
					</div>
					<div>
						<label className={labelClass}>Visibility</label>
						<select value={visibility} onChange={(e) => setVisibility(e.target.value as typeof visibility)} className={selectClass}>
							{visibilities.map((v) => <option key={v} value={v}>{v}</option>)}
						</select>
					</div>
				</div>

				<div>
					<label className={labelClass}>Size (val: 1-10)</label>
					<input
						type="number"
						value={val}
						onChange={(e) => setVal(Number(e.target.value))}
						min={1}
						max={10}
						className={inputClass}
					/>
				</div>
			</div>

			<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 space-y-4">
				<p className="text-white/50 text-xs font-medium uppercase tracking-wider">Metadata</p>

				<div>
					<label className={labelClass}>Description</label>
					<input
						type="text"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className={inputClass}
						placeholder="Short description"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className={labelClass}>Date</label>
						<input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className={inputClass}
						/>
					</div>
					<div>
						<label className={labelClass}>Category</label>
						<input
							type="text"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className={inputClass}
							placeholder="e.g. Web Dev"
						/>
					</div>
				</div>

				<div>
					<label className={labelClass}>Tags (comma-separated)</label>
					<input
						type="text"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						className={inputClass}
						placeholder="react, typescript, web"
					/>
				</div>

				<div>
					<label className={labelClass}>Link</label>
					<input
						type="url"
						value={link}
						onChange={(e) => setLink(e.target.value)}
						className={inputClass}
						placeholder="https://..."
					/>
				</div>
			</div>

			<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 space-y-4">
				<p className="text-white/50 text-xs font-medium uppercase tracking-wider">Content (Markdown)</p>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className={`${inputClass} min-h-[200px] resize-y font-mono`}
					placeholder="Write content in Markdown..."
				/>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="submit"
					disabled={saving || !title}
					className="px-6 py-2.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.15] disabled:opacity-40 disabled:cursor-not-allowed text-white/90 text-sm font-medium transition-colors"
				>
					{saving ? "Saving..." : initialData ? "Update Node" : "Create Node"}
				</button>
			</div>
		</form>
	)
}
