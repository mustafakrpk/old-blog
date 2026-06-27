import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import {
	user,
	session,
	account,
	verification,
	workspaces,
	members,
	invites,
} from "@/db/schema"

function slugify(s: string): string {
	return (
		s
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 24) || "user"
	)
}

// Apex + admin domainleri (Türkçe + punycode) güvenilir origin'ler.
// Ek origin'leri TRUSTED_ORIGINS env'inden (virgülle) ekleyebilirsin.
const trustedOrigins = [
	"http://localhost:3000",
	"https://mustafakırpık.com",
	"https://admin.mustafakırpık.com",
	"https://xn--mustafakrpk-6zbc.com",
	"https://admin.xn--mustafakrpk-6zbc.com",
	...(process.env.TRUSTED_ORIGINS?.split(",").map((s) => s.trim()) ?? []),
].filter(Boolean)

export const auth = betterAuth({
	trustedOrigins,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: { user, session, account, verification },
	}),
	emailAndPassword: {
		enabled: true,
	},
	databaseHooks: {
		user: {
			create: {
				// Yeni kullanıcı kaydolunca: kişisel workspace + owner üyeliği,
				// ayrıca bekleyen davetleri üyeliğe çevir.
				after: async (createdUser) => {
					const base = slugify(createdUser.email.split("@")[0])
					const wsId = randomUUID()
					await db.insert(workspaces).values({
						id: wsId,
						ownerId: createdUser.id,
						slug: `${base}-${randomUUID().slice(0, 6)}`,
						name: createdUser.name || base,
						plan: "free",
						defaultMode: "professional",
					})
					await db.insert(members).values({
						workspaceId: wsId,
						userId: createdUser.id,
						role: "owner",
					})

					// Bu e-postaya gelmiş davetleri üyeliğe çevir.
					const pending = await db
						.select()
						.from(invites)
						.where(eq(invites.email, createdUser.email))
					for (const inv of pending) {
						await db
							.insert(members)
							.values({
								workspaceId: inv.workspaceId,
								userId: createdUser.id,
								role: inv.role,
							})
							.onConflictDoNothing()
					}
					if (pending.length > 0) {
						await db
							.delete(invites)
							.where(eq(invites.email, createdUser.email))
					}
				},
			},
		},
	},
	// Google provider (sonra Faz 1/2'de açılacak):
	// socialProviders: {
	// 	google: {
	// 		clientId: process.env.GOOGLE_CLIENT_ID!,
	// 		clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	// 	},
	// },
})

export type Session = typeof auth.$Infer.Session
