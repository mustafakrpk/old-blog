"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { importMarkdown } from "@/actions/admin"

interface Loaded {
	name: string
	content: string
}

export default function ImportForm() {
	const router = useRouter()
	const [files, setFiles] = useState<Loaded[]>([])
	const [pasteName, setPasteName] = useState("")
	const [pasteBody, setPasteBody] = useState("")
	const [pending, startTransition] = useTransition()
	const [result, setResult] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
		const picked = Array.from(e.target.files ?? [])
		const loaded = await Promise.all(
			picked.map(async (f) => ({ name: f.name, content: await f.text() })),
		)
		setFiles((prev) => [...prev, ...loaded])
		e.target.value = ""
	}

	function addPaste() {
		if (!pasteBody.trim()) return
		const name = (pasteName.trim() || "yeni-not") + ".md"
		setFiles((prev) => [...prev, { name, content: pasteBody }])
		setPasteName("")
		setPasteBody("")
	}

	function removeAt(i: number) {
		setFiles((prev) => prev.filter((_, idx) => idx !== i))
	}

	function doImport() {
		setError(null)
		setResult(null)
		startTransition(async () => {
			try {
				const r = await importMarkdown(files)
				setResult(
					`${r.nodes} node, ${r.links} bağlantı eklendi` +
						(r.skippedLinks ? ` (${r.skippedLinks} geçersiz link atlandı)` : ""),
				)
				setFiles([])
				router.refresh()
			} catch {
				setError("İçe aktarma başarısız oldu.")
			}
		})
	}

	const inputClass =
		"w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm outline-none focus:border-white/15 placeholder-white/20"

	return (
		<div className="space-y-6 max-w-2xl">
			{/* Dosya yükle */}
			<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
				<p className="text-white/70 text-sm font-medium mb-1">
					.md dosyalarını yükle
				</p>
				<p className="text-white/35 text-xs mb-3">
					Obsidian vault'undan birden fazla dosya seçebilirsin.
					<code className="text-purple-300/80"> [[wiki-link]] </code>
					bağlantıları otomatik çözülür.
				</p>
				<input
					type="file"
					accept=".md,.markdown,text/markdown"
					multiple
					onChange={onPick}
					className="block w-full text-sm text-white/50 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-white/[0.1] file:text-white/80 file:text-xs file:cursor-pointer hover:file:bg-white/[0.15]"
				/>
			</div>

			{/* Yapıştır */}
			<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
				<p className="text-white/70 text-sm font-medium mb-3">
					veya tek bir not yapıştır
				</p>
				<input
					value={pasteName}
					onChange={(e) => setPasteName(e.target.value)}
					placeholder="Not başlığı / dosya adı"
					className={inputClass + " mb-2"}
				/>
				<textarea
					value={pasteBody}
					onChange={(e) => setPasteBody(e.target.value)}
					placeholder="# Markdown içeriği&#10;&#10;Başka notlara [[bağlantı]] verebilirsin."
					rows={5}
					className={inputClass + " resize-y"}
				/>
				<button
					onClick={addPaste}
					disabled={!pasteBody.trim()}
					className="mt-2 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 text-white/80 text-xs font-medium transition-colors"
				>
					Listeye ekle
				</button>
			</div>

			{/* Seçilenler */}
			{files.length > 0 && (
				<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/60 text-xs uppercase tracking-wider mb-3">
						İçe aktarılacak ({files.length})
					</p>
					<ul className="space-y-1.5 mb-4">
						{files.map((f, i) => (
							<li
								key={i}
								className="flex items-center justify-between text-sm"
							>
								<span className="text-white/70 truncate">{f.name}</span>
								<button
									onClick={() => removeAt(i)}
									className="text-white/30 hover:text-red-400 text-xs ml-3"
								>
									kaldır
								</button>
							</li>
						))}
					</ul>
					<button
						onClick={doImport}
						disabled={pending}
						className="px-4 py-2 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 disabled:opacity-40 text-purple-100 text-sm font-medium transition-colors"
					>
						{pending ? "İçe aktarılıyor…" : `${files.length} dosyayı içe aktar`}
					</button>
				</div>
			)}

			{result && (
				<div className="rounded-lg bg-green-500/15 border border-green-500/25 px-4 py-3 text-green-200 text-sm">
					✓ {result} —{" "}
					<a href="/admin/nodes" className="underline">
						node'lara git
					</a>
				</div>
			)}
			{error && (
				<p className="text-red-400 text-sm">{error}</p>
			)}
		</div>
	)
}
