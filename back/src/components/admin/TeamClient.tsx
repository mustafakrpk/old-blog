"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
	inviteMember,
	updateMemberRole,
	removeMember,
	cancelInvite,
} from "@/actions/team"

interface Member {
	userId: string
	role: string
	name: string
	email: string
}
interface Invite {
	email: string
	role: string
}

export default function TeamClient({
	myRole,
	members,
	pending,
}: {
	myRole: string
	members: Member[]
	pending: Invite[]
}) {
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [role, setRole] = useState("member")
	const [busy, startTransition] = useTransition()
	const [msg, setMsg] = useState<string | null>(null)
	const canManage = myRole === "owner" || myRole === "admin"

	function run(fn: () => Promise<unknown>, ok?: string) {
		setMsg(null)
		startTransition(async () => {
			try {
				await fn()
				if (ok) setMsg(ok)
				router.refresh()
			} catch (e) {
				setMsg(
					e instanceof Error && e.message === "LAST_OWNER"
						? "Son owner'ı kaldıramazsın."
						: "İşlem başarısız.",
				)
			}
		})
	}

	const roleOpts = ["member", "admin", "owner"]
	const sel =
		"px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/70 text-xs outline-none"

	return (
		<div className="space-y-8 max-w-2xl">
			{canManage && (
				<div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5">
					<p className="text-white/70 text-sm font-medium mb-3">Üye davet et</p>
					<div className="flex gap-2">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="kisi@example.com"
							className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm outline-none focus:border-white/15 placeholder-white/20"
						/>
						<select
							value={role}
							onChange={(e) => setRole(e.target.value)}
							className={sel}
						>
							{roleOpts.map((r) => (
								<option key={r} value={r} className="bg-[#0a0a18]">
									{r}
								</option>
							))}
						</select>
						<button
							onClick={() =>
								run(() => inviteMember(email, role), "Davet gönderildi")
							}
							disabled={busy || !email}
							className="px-4 py-2 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 disabled:opacity-40 text-purple-100 text-sm font-medium"
						>
							Davet et
						</button>
					</div>
					<p className="text-white/30 text-xs mt-2">
						Hesabı olan kişi hemen eklenir; olmayan kişi kaydolunca otomatik
						katılır.
					</p>
				</div>
			)}

			{msg && <p className="text-sm text-white/60">{msg}</p>}

			{/* Üyeler */}
			<div>
				<p className="text-white/40 text-xs uppercase tracking-wider mb-3">
					Üyeler ({members.length})
				</p>
				<div className="space-y-2">
					{members.map((m) => (
						<div
							key={m.userId}
							className="flex items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-lg px-4 py-3"
						>
							<div className="min-w-0">
								<p className="text-white/85 text-sm truncate">{m.name}</p>
								<p className="text-white/35 text-xs truncate">{m.email}</p>
							</div>
							<div className="flex items-center gap-2">
								{canManage ? (
									<select
										value={m.role}
										onChange={(e) =>
											run(() => updateMemberRole(m.userId, e.target.value))
										}
										disabled={busy}
										className={sel}
									>
										{roleOpts.map((r) => (
											<option key={r} value={r} className="bg-[#0a0a18]">
												{r}
											</option>
										))}
									</select>
								) : (
									<span className="text-white/50 text-xs">{m.role}</span>
								)}
								{canManage && (
									<button
										onClick={() => run(() => removeMember(m.userId))}
										disabled={busy}
										className="text-white/30 hover:text-red-400 text-xs"
									>
										çıkar
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Bekleyen davetler */}
			{pending.length > 0 && (
				<div>
					<p className="text-white/40 text-xs uppercase tracking-wider mb-3">
						Bekleyen davetler ({pending.length})
					</p>
					<div className="space-y-2">
						{pending.map((p) => (
							<div
								key={p.email}
								className="flex items-center justify-between bg-white/[0.02] border border-dashed border-white/[0.08] rounded-lg px-4 py-2.5"
							>
								<span className="text-white/55 text-sm truncate">
									{p.email}{" "}
									<span className="text-white/25 text-xs">· {p.role}</span>
								</span>
								{canManage && (
									<button
										onClick={() => run(() => cancelInvite(p.email))}
										disabled={busy}
										className="text-white/30 hover:text-red-400 text-xs"
									>
										iptal
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
