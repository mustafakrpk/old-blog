"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginAction } from "@/actions/admin"

export default function AdminLoginPage() {
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError("")

		const ok = await loginAction(password)
		if (ok) {
			router.push("/admin")
		} else {
			setError("Wrong password")
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-[#000011] flex items-center justify-center px-4">
			<div className="w-full max-w-sm">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-white/90">Admin Panel</h1>
					<p className="text-white/30 text-sm mt-1">Enter password to continue</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-4"
				>
					<div>
						<label className="block text-white/40 text-xs font-medium mb-1.5">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/90 text-sm outline-none focus:border-white/20 transition-colors placeholder-white/20"
							placeholder="Enter admin password"
							autoFocus
						/>
					</div>

					{error && (
						<p className="text-red-400 text-xs">{error}</p>
					)}

					<button
						type="submit"
						disabled={loading || !password}
						className="w-full py-2.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.15] disabled:opacity-40 disabled:cursor-not-allowed text-white/90 text-sm font-medium transition-colors"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	)
}
