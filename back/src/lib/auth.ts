import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { randomUUID } from "crypto"
import { db } from "@/db"
import { user, session, account, verification, workspaces } from "@/db/schema"

function slugify(s: string): string {
	return (
		s
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 24) || "user"
	)
}

export const auth = betterAuth({
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
				// Yeni kullanıcı kaydolunca otomatik bir workspace (graph) aç.
				after: async (createdUser) => {
					const base = slugify(createdUser.email.split("@")[0])
					await db.insert(workspaces).values({
						id: randomUUID(),
						ownerId: createdUser.id,
						slug: `${base}-${randomUUID().slice(0, 6)}`,
						name: createdUser.name || base,
						plan: "free",
						defaultMode: "professional",
					})
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
