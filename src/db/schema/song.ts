import { pgTable } from "drizzle-orm/pg-core";

const songPlayHistory = pgTable("song_play_history", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey(),
  userId: t.uuid("user_id").notNull(),
  songId: t.text("song_id").notNull(),
  title: t.text("title").notNull(),
  url: t.text("url").notNull(),
  thumbnail: t.text("thumbnail").notNull(),
  duration: t.text("duration").notNull(),
  seconds: t.integer("seconds").notNull(),
  playedAt: t.timestamp("played_at").defaultNow().notNull(),
}));

const songSearchHistory = pgTable("song_search_history", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey(),
  userId: t.uuid("user_id").notNull(),
  query: t.text("query").notNull(),
  searchedAt: t.timestamp("searched_at").defaultNow().notNull(),
}));

export { songPlayHistory, songSearchHistory };
