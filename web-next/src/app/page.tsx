import { getGraphData } from "@/actions/graph"
import HomeClient from "./home-client"

export const dynamic = "force-dynamic"

export default async function HomePage() {
	const initialData = await getGraphData("professional")
	return <HomeClient initialData={initialData} />
}
