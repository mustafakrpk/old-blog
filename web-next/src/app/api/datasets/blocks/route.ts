import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET() {
	try {
		const filePath = path.join(
			process.cwd(),
			"public",
			"datasets",
			"blocks.json",
		)
		const data = await readFile(filePath, "utf-8")
		return new NextResponse(data, {
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=86400",
			},
		})
	} catch {
		return NextResponse.json(
			{ error: "Dataset not found" },
			{ status: 404 },
		)
	}
}
