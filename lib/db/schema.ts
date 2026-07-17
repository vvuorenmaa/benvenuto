import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mode: text("mode").notNull(),               // 'grammar' | 'conversation' | 'phonetics'
  role: text("role").notNull(),                // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),  // unix ms
});
