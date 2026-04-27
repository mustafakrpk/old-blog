import { NextRequest, NextResponse } from "next/server"
import { getGraphData } from "@/actions/graph"
import type { FocusMode } from "@/lib/types"

const VALID_MODES: FocusMode[] = ["professional", "explorer", "god_mode"]

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
	return NextResponse.json(null, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
	const mode = request.nextUrl.searchParams.get("mode") as FocusMode
	if (!mode || !VALID_MODES.includes(mode)) {
		return NextResponse.json({ error: "Invalid mode" }, { status: 400, headers: corsHeaders })
	}
	const data = await getGraphData(mode)
	return NextResponse.json(data, { headers: corsHeaders })
}
