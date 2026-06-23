import ImportForm from "@/components/admin/ImportForm"

export const dynamic = "force-dynamic"

export default function ImportPage() {
	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">İçe Aktar</h1>
			<p className="text-white/30 text-sm mb-6">
				Markdown / Obsidian notlarını graph'ına aktar
			</p>
			<ImportForm />
		</div>
	)
}
