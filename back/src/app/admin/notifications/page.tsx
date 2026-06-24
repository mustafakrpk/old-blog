import Link from "next/link"
import { getNotifications } from "@/actions/notifications"
import MarkRead from "@/components/admin/MarkRead"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
	const items = await getNotifications()

	return (
		<div className="p-8 max-w-2xl">
			<MarkRead />
			<h1 className="text-2xl font-bold text-white/90 mb-1">Bildirimler</h1>
			<p className="text-white/30 text-sm mb-6">Galaksinle ilgili olaylar</p>

			{items.length === 0 ? (
				<p className="text-white/40 text-sm bg-white/[0.04] border border-white/[0.07] rounded-xl p-6 text-center">
					Henüz bildirim yok.
				</p>
			) : (
				<div className="space-y-2">
					{items.map((n) => (
						<div
							key={n.id}
							className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
								n.read
									? "bg-white/[0.02] border-white/[0.06]"
									: "bg-purple-500/[0.06] border-purple-400/20"
							}`}
						>
							<span className="text-lg">👤</span>
							<p className="text-sm text-white/80">
								{n.type === "follow" ? (
									<>
										<Link
											href={`/u/${n.actorSlug}`}
											className="font-semibold text-white/90 hover:underline"
										>
											{n.actorName || n.actorSlug}
										</Link>{" "}
										seni takip etmeye başladı
									</>
								) : (
									n.type
								)}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
