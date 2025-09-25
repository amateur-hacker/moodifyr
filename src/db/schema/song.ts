import { pgTable } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/auth";

const songs = pgTable("songs", (t) => ({
  id: t.text("id").primaryKey().notNull(),
  title: t.text("title").notNull(),
  thumbnail: t.text("thumbnail").notNull(),
  duration: t.json().notNull().$type<{ seconds: number; timestamp: string }>(),
  category: t.text("category"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
}));

const songPlayHistory = pgTable("song_play_history", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  songId: t
    .text("song_id")
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  playedAt: t.timestamp("played_at").defaultNow().notNull(),
}));

const songAnalyticsPlayHistory = pgTable(
  "song_analytics_play_history",
  (t) => ({
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: t
      .text("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    playedAt: t.timestamp("played_at").defaultNow().notNull(),
  }),
);

const songSearchHistory = pgTable("song_search_history", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  query: t.text("query").notNull(),
  searchedAt: t.timestamp("searched_at").defaultNow().notNull(),
}));

const favouriteSongs = pgTable("favourite_songs", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey(),
  songId: t.text("songId").notNull(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: t.text("title").notNull(),
  thumbnail: t.text("thumbnail").notNull(),
  duration: t.json().notNull().$type<{ seconds: number; timestamp: string }>(),
  favouritedAt: t.timestamp("favourited_at").defaultNow().notNull(),
}));

export {
  songs,
  songPlayHistory,
  songAnalyticsPlayHistory,
  songSearchHistory,
  favouriteSongs,
};
