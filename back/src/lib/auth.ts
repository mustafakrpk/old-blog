import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { user, session, account, verification } from "@/db/schema"

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: { user, session, account, verification },
	}),
	emailAndPassword: {
		enabled: true,
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
