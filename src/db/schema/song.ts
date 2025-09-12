import { pgTable } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/auth";

const songs = pgTable("songs", (t) => ({
  id: t.text("id").primaryKey().notNull(),
  title: t.text("title").notNull(),
  url: t.text("url").notNull(),
  thumbnail: t.text("thumbnail").notNull(),
  seconds: t.integer("seconds").notNull(),
  mood: t.text("mood"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
}));

const songPlayHistory = pgTable("song_play_history", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  songId: t.text("song_id").notNull(),
  playedAt: t.timestamp("played_at").defaultNow().notNull(),
}));

const songSearchHistory = pgTable("song_search_history", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  query: t.text("query").notNull(),
  searchedAt: t.timestamp("searched_at").defaultNow().notNull(),
}));

export { songs, songPlayHistory, songSearchHistory };
