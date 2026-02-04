import {
	pgTable,
	text,
	integer,
	jsonb,
	pgEnum,
	primaryKey,
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

// ── Inferred Types ───────────────────────────────────────────────
export type Node = typeof nodes.$inferSelect
export type NewNode = typeof nodes.$inferInsert
export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
