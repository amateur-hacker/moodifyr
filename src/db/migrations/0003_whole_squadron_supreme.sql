CREATE TABLE "songs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text NOT NULL,
	"seconds" integer NOT NULL,
	"mood" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "song_play_history" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "song_play_history" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "song_play_history" DROP COLUMN "thumbnail";--> statement-breakpoint
ALTER TABLE "song_play_history" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "song_play_history" DROP COLUMN "seconds";