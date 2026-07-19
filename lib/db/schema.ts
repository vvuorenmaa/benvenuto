import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mode: text("mode").notNull(),               // 'grammar' | 'conversation' | 'phonetics'
  role: text("role").notNull(),                // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),  // unix ms
  sessionId: text("session_id"),               // groups messages into a persisted chat session (Epic 16); null for legacy rows
});

export const vocabCards = sqliteTable("vocab_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  italian: text("italian").notNull(),
  finnish: text("finnish").notNull(),
  exampleIt: text("example_it"),
  exampleFi: text("example_fi"),
  context: text("context"),
  sourceMode: text("source_mode"),
  sourceMessageId: integer("source_message_id").references(() => messages.id),
  grammarTopicSlug: text("grammar_topic_slug"),
  createdAt: integer("created_at").notNull(),

  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer("repetitions").notNull().default(0),
  dueAt: integer("due_at").notNull(),
  lastReviewedAt: integer("last_reviewed_at"),
  suspended: integer("suspended").notNull().default(0),
});

export const reviewLog = sqliteTable("review_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id").notNull().references(() => vocabCards.id),
  reviewedAt: integer("reviewed_at").notNull(),
  grade: integer("grade").notNull(),
  intervalBefore: integer("interval_before"),
  intervalAfter: integer("interval_after"),
});
