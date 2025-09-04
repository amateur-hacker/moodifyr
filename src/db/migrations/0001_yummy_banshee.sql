CREATE TABLE "song_play_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"song_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text NOT NULL,
	"duration" text NOT NULL,
	"seconds" integer NOT NULL,
	"played_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song_search_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"query" text NOT NULL,
	"searched_at" timestamp DEFAULT now() NOT NULL
);
