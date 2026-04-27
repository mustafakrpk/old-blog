import { cookies } from "next/headers"
import crypto from "crypto"

const ADMIN_COOKIE = "admin_session"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24h

export function verifyAdminPassword(password: string): boolean {
	return password === process.env.ADMIN_PASSWORD
}

export function createSessionToken(): string {
	const timestamp = Date.now().toString()
	const hash = crypto
		.createHash("sha256")
		.update(timestamp + process.env.ADMIN_PASSWORD)
		.digest("hex")
		.slice(0, 16)
	return Buffer.from(`${timestamp}:${hash}`).toString("base64")
}

export async function isAdminAuthenticated(): Promise<boolean> {
	const cookieStore = await cookies()
	const session = cookieStore.get(ADMIN_COOKIE)
	if (!session) return false

	try {
		const decoded = Buffer.from(session.value, "base64").toString()
		const [timestamp] = decoded.split(":")
		const ts = parseInt(timestamp, 10)
		return Date.now() - ts < SESSION_DURATION
	} catch {
		return false
	}
}
