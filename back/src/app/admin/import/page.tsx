import ImportForm from "@/components/admin/ImportForm"

export const dynamic = "force-dynamic"

export default function ImportPage() {
	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Import</h1>
			<p className="text-white/30 text-sm mb-6">
				Import Markdown / Obsidian notes into your graph
			</p>
			<ImportForm />
		</div>
	)
}
