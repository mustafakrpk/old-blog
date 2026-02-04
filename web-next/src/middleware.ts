import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Skip login page
	if (pathname === "/admin/login") {
		return NextResponse.next()
	}

	// Protect /admin/* routes
	if (pathname.startsWith("/admin")) {
		const session = request.cookies.get("admin_session")

		if (!session) {
			return NextResponse.redirect(new URL("/admin/login", request.url))
		}

		// Validate session expiry
		try {
			const decoded = Buffer.from(session.value, "base64").toString()
			const [timestamp] = decoded.split(":")
			const ts = parseInt(timestamp, 10)
			const expired = Date.now() - ts > 24 * 60 * 60 * 1000

			if (expired) {
				const response = NextResponse.redirect(
					new URL("/admin/login", request.url),
				)
				response.cookies.delete("admin_session")
				return response
			}
		} catch {
			return NextResponse.redirect(new URL("/admin/login", request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/admin/:path*"],
}
