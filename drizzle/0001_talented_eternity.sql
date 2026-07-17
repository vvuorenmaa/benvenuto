CREATE TABLE `review_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	`grade` integer NOT NULL,
	`interval_before` integer,
	`interval_after` integer,
	FOREIGN KEY (`card_id`) REFERENCES `vocab_cards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vocab_cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`italian` text NOT NULL,
	`finnish` text NOT NULL,
	`example_it` text,
	`example_fi` text,
	`context` text,
	`source_mode` text,
	`source_message_id` integer,
	`grammar_topic_slug` text,
	`created_at` integer NOT NULL,
	`ease_factor` real DEFAULT 2.5 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`last_reviewed_at` integer,
	`suspended` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`source_message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action
);
