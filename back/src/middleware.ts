import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Skip login page
	if (pathname === "/admin/login") {
		return NextResponse.next()
	}

	// Protect /admin/* routes — optimistic cookie check (edge-safe).
	// Asıl doğrulama server action / sayfa içinde auth.api.getSession ile yapılır.
	if (pathname.startsWith("/admin")) {
		const sessionCookie = getSessionCookie(request)
		if (!sessionCookie) {
			return NextResponse.redirect(new URL("/admin/login", request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/admin/:path*"],
}
