import {
	pgTable,
	text,
	integer,
	jsonb,
	pgEnum,
	primaryKey,
	boolean,
	timestamp,
	foreignKey,
} from "drizzle-orm/pg-core"

// ── Enums ────────────────────────────────────────────────────────
export const nodeTypeEnum = pgEnum("node_type", [
	// genel (mevcut)
	"hub",
	"project",
	"skill",
	"blog",
	"note",
	"resource",
	"hobby",
	"dataset",
	// worldbuilding (dünya kurma)
	"character",
	"location",
	"faction",
	"event",
	"lore",
	"item",
	"creature",
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

// ── Workspaces (tenant) ──────────────────────────────────────────
// Her kullanıcının izole graph'ı bir workspace'tir. Public URL slug ile.
export const workspaces = pgTable("workspaces", {
	id: text("id").primaryKey(),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	slug: text("slug").notNull().unique(),
	name: text("name").notNull(),
	plan: text("plan").notNull().default("free"), // free | pro | team
	theme: text("theme").notNull().default("galaxy"),
	listed: boolean("listed").notNull().default(true), // Keşfet'te görünsün mü
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	customDomain: text("custom_domain"),
	// Public ziyaretçinin görebileceği en yüksek mod (gizlilik tavanı).
	defaultMode: visibilityEnum("default_mode").notNull().default("professional"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ── Members (takım üyeliği) ──────────────────────────────────────
// Bir workspace'e birden çok kullanıcı üye olabilir (roller: owner|admin|member).
export const members = pgTable(
	"members",
	{
		workspaceId: text("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull().default("member"), // owner | admin | member
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.workspaceId, t.userId] }),
	}),
)

// Hesabı olmayan kişiye davet — kayıt olunca üyeliğe çevrilir.
export const invites = pgTable(
	"invites",
	{
		workspaceId: text("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		role: text("role").notNull().default("member"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.workspaceId, t.email] }),
	}),
)

// Takip: bir workspace (galaksi) başka bir workspace'i takip eder.
export const follows = pgTable(
	"follows",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.followerId, t.followingId] }),
	}),
)

// Bildirim: bir workspace'e (alıcı) gelen olaylar (ör. "X seni takip etti").
export const notifications = pgTable("notifications", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id")
		.notNull()
		.references(() => workspaces.id, { onDelete: "cascade" }),
	type: text("type").notNull(), // follow
	actorSlug: text("actor_slug"),
	actorName: text("actor_name"),
	read: boolean("read").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ── Tables ───────────────────────────────────────────────────────
export const nodes = pgTable(
	"nodes",
	{
		workspaceId: text("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		id: text("id").notNull(), // slug — workspace içinde unique
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
	},
	(t) => ({
		pk: primaryKey({ columns: [t.workspaceId, t.id] }),
	}),
)

export const links = pgTable(
	"links",
	{
		workspaceId: text("workspace_id").notNull(),
		source: text("source").notNull(),
		target: text("target").notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.workspaceId, t.source, t.target] }),
		sourceFk: foreignKey({
			columns: [t.workspaceId, t.source],
			foreignColumns: [nodes.workspaceId, nodes.id],
		}).onDelete("cascade"),
		targetFk: foreignKey({
			columns: [t.workspaceId, t.target],
			foreignColumns: [nodes.workspaceId, nodes.id],
		}).onDelete("cascade"),
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

// Hafif olay kaydı (ör. "pro_click" — ödeme niyeti sinyali).
export const events = pgTable("events", {
	id: text("id").primaryKey(),
	type: text("type").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ── Analytics ────────────────────────────────────────────────────
export const pageViews = pgTable("page_views", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id")
		.notNull()
		.references(() => workspaces.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ── Inferred Types ───────────────────────────────────────────────
export type Node = typeof nodes.$inferSelect
export type NewNode = typeof nodes.$inferInsert
export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert
export type Member = typeof members.$inferSelect
export type Invite = typeof invites.$inferSelect
