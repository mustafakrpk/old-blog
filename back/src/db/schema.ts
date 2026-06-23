import {
	pgTable,
	text,
	integer,
	jsonb,
	pgEnum,
	primaryKey,
	boolean,
	timestamp,
} from "drizzle-orm/pg-core"

// ── Enums ────────────────────────────────────────────────────────
export const nodeTypeEnum = pgEnum("node_type", [
	"hub",
	"project",
	"skill",
	"blog",
	"note",
	"resource",
	"hobby",
	"dataset",
])

export const clusterEnum = pgEnum("cluster", [
	"core",
	"career",
	"library",
	"playground",
	"life",
])

export const visibilityEnum = pgEnum("visibility", [
	"professional",
	"explorer",
	"god_mode",
])

// ── Tables ───────────────────────────────────────────────────────
export const nodes = pgTable("nodes", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	type: nodeTypeEnum("type").notNull(),
	cluster: clusterEnum("cluster").notNull().default("core"),
	visibility: visibilityEnum("visibility").notNull().default("professional"),
	val: integer("val").notNull().default(1),
	content: text("content"),
	meta: jsonb("meta").$type<{
		description?: string
		date?: string
		tags?: string[]
		image?: string
		link?: string
		category?: string
	}>(),
})

export const links = pgTable(
	"links",
	{
		source: text("source")
			.notNull()
			.references(() => nodes.id, { onDelete: "cascade" }),
		target: text("target")
			.notNull()
			.references(() => nodes.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.source, table.target] }),
	}),
)

// ── Better-Auth Tables ───────────────────────────────────────────
// Better-Auth'un beklediği standart şema (v1.x). Kolon adları sabit;
// elle değiştirme — adapter bu adlara göre çalışır.
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
})

// ── Inferred Types ───────────────────────────────────────────────
export type Node = typeof nodes.$inferSelect
export type NewNode = typeof nodes.$inferInsert
export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
