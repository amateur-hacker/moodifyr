import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { users } from "@/db/schema/auth";

const songs = pgTable("songs", (t) => ({
  id: t.text().primaryKey().notNull(),
  title: t.text().notNull(),
  thumbnail: t.text().notNull(),
  duration: t.json().notNull().$type<{ seconds: number; timestamp: string }>(),
  category: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
}));

const songPlayHistory = pgTable("song_play_history", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  songId: t
    .text()
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  playedAt: t.timestamp().defaultNow().notNull(),
}));

const songAnalyticsPlayHistory = pgTable(
  "song_analytics_play_history",
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey().notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: t
      .text()
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    playedAt: t.timestamp().defaultNow().notNull(),
  }),
);

const songSearchHistory = pgTable(
  "song_search_history",
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey().notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    query: t.text().notNull(),
    searchedAt: t.timestamp().defaultNow().notNull(),
  }),
  (t) => [index().on(t.query)],
);

const favouriteSongs = pgTable("favourite_songs", (t) => ({
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  songId: t
    .text()
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  favouritedAt: t.timestamp().defaultNow().notNull(),
}));

const songsRelations = relations(songs, ({ many }) => ({
  favouriteByUsers: many(favouriteSongs),
  playHistory: many(songPlayHistory),
  analyticsHistory: many(songAnalyticsPlayHistory),
}));

const favouriteSongsRelations = relations(favouriteSongs, ({ one }) => ({
  song: one(songs, { fields: [favouriteSongs.songId], references: [songs.id] }),
  user: one(users, { fields: [favouriteSongs.userId], references: [users.id] }),
}));

const songPlayHistoryRelations = relations(songPlayHistory, ({ one }) => ({
  song: one(songs, {
    fields: [songPlayHistory.songId],
    references: [songs.id],
  }),
  user: one(users, {
    fields: [songPlayHistory.userId],
    references: [users.id],
  }),
}));

const songAnalyticsPlayHistoryRelations = relations(
  songAnalyticsPlayHistory,
  ({ one }) => ({
    song: one(songs, {
      fields: [songAnalyticsPlayHistory.songId],
      references: [songs.id],
    }),
    user: one(users, {
      fields: [songAnalyticsPlayHistory.userId],
      references: [users.id],
    }),
  }),
);

const songSearchHistoryRelations = relations(songSearchHistory, ({ one }) => ({
  user: one(users, {
    fields: [songSearchHistory.userId],
    references: [users.id],
  }),
}));

const songSchema = createInsertSchema(songs).omit({
  createdAt: true,
});
type SongSchema = z.infer<typeof songSchema>;
type SelectSongModel = InferSelectModel<typeof songs>;

const songPlayHistorySchema = createInsertSchema(songPlayHistory, {
  id: z.uuid().min(1),
}).omit({
  playedAt: true,
});
type SongPlayHistorySchema = z.infer<typeof songPlayHistorySchema>;
type SelectSongPlayHistoryModel = InferSelectModel<typeof songPlayHistory>;

const songAnalyticsPlayHistorySchema = createInsertSchema(
  songAnalyticsPlayHistory,
  {
    id: z.uuid().min(1),
  },
).omit({
  playedAt: true,
});
type SongAnalyticsPlayHistorySchema = z.infer<
  typeof songAnalyticsPlayHistorySchema
>;
type SelectSongAnalyticsPlayHistoryModel = InferSelectModel<
  typeof songAnalyticsPlayHistory
>;

const songSearchHistorySchema = createInsertSchema(songSearchHistory, {
  id: z.uuid().min(1),
}).omit({
  searchedAt: true,
});
type SongSearchHistorySchema = z.infer<typeof songSearchHistorySchema>;
type SelectSongSearchHistoryModel = InferSelectModel<
  typeof songAnalyticsPlayHistory
>;

const favouriteSongSchema = createInsertSchema(favouriteSongs, {
  id: z.uuid().min(1),
}).omit({
  favouritedAt: true,
});
type FavouriteSongSchema = z.infer<typeof favouriteSongSchema>;
type SelectFavouriteSongModel = InferSelectModel<typeof favouriteSongs>;

export {
  favouriteSongs,
  favouriteSongSchema,
  favouriteSongsRelations,
  songAnalyticsPlayHistory,
  songAnalyticsPlayHistoryRelations,
  songAnalyticsPlayHistorySchema,
  songPlayHistory,
  songPlayHistoryRelations,
  songPlayHistorySchema,
  songs,
  songSchema,
  songSearchHistory,
  songSearchHistoryRelations,
  songSearchHistorySchema,
  songsRelations,
  type FavouriteSongSchema,
  type SelectFavouriteSongModel,
  type SelectSongAnalyticsPlayHistoryModel,
  type SelectSongModel,
  type SelectSongPlayHistoryModel,
  type SelectSongSearchHistoryModel,
  type SongAnalyticsPlayHistorySchema,
  type SongPlayHistorySchema,
  type SongSchema,
  type SongSearchHistorySchema,
};
