import { getMyWorkspace } from "@/actions/admin"
import { isBillingEnabled } from "@/lib/stripe"
import BillingClient from "@/components/admin/BillingClient"

export const dynamic = "force-dynamic"

export default async function BillingPage({
	searchParams,
}: {
	searchParams: Promise<{ success?: string }>
}) {
	const [ws, sp] = await Promise.all([getMyWorkspace(), searchParams])

	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Faturalandırma</h1>
			<p className="text-white/30 text-sm mb-6">Planını yönet</p>
			<BillingClient
				plan={ws.plan}
				billingEnabled={isBillingEnabled()}
				success={sp?.success === "1"}
			/>
		</div>
	)
}
