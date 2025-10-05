import { capitalCase } from "change-case";
import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "@/db/schema/auth";
import { songs } from "@/db/schema/song";

const moodlists = pgTable("moodlists", (t) => ({
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));

const moodlistSongs = pgTable("moodlist_songs", (t) => ({
  id: t.uuid("id").defaultRandom().primaryKey().notNull(),
  moodlistId: t
    .uuid()
    .notNull()
    .references(() => moodlists.id, { onDelete: "cascade" }),
  songId: t
    .text()
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  addedAt: t.timestamp().defaultNow().notNull(),
}));

const moodlistFollowers = pgTable("moodlist_followers", (t) => ({
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  moodlistId: t
    .uuid()
    .notNull()
    .references(() => moodlists.id, { onDelete: "cascade" }),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followedAt: t.timestamp().defaultNow().notNull(),
}));

const moodlistsRelations = relations(moodlists, ({ many }) => ({
  songs: many(moodlistSongs),
  followers: many(moodlistFollowers),
}));

const moodlistSongsRelations = relations(moodlistSongs, ({ one }) => ({
  moodlist: one(moodlists, {
    fields: [moodlistSongs.moodlistId],
    references: [moodlists.id],
  }),
  user: one(users, {
    fields: [moodlistSongs.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [moodlistSongs.songId],
    references: [songs.id],
  }),
}));

const moodlistFollowersRelations = relations(moodlistFollowers, ({ one }) => ({
  moodlist: one(moodlists, {
    fields: [moodlistFollowers.moodlistId],
    references: [moodlists.id],
  }),
  user: one(users, {
    fields: [moodlistFollowers.userId],
    references: [users.id],
  }),
}));

const moodlistSchema = createInsertSchema(moodlists, {
  id: z.uuid().min(1),
  name: z
    .string()
    .min(3)
    .max(50)
    .transform((val) => capitalCase(val)),
}).omit({ createdAt: true, updatedAt: true });
type MoodlistSchema = z.infer<typeof moodlistSchema>;
type SelectMoodlistModel = InferSelectModel<typeof moodlists>;

const moodlistSongSchema = createInsertSchema(moodlistSongs, {
  id: z.uuid().min(1),
}).omit({ addedAt: true });
type MoodlistSongSchema = z.infer<typeof moodlistSongSchema>;
type SelectMoodlistSongModel = InferSelectModel<typeof moodlistSongs>;

const moodlistFollowerSchema = createInsertSchema(moodlistFollowers, {
  id: z.uuid().min(1),
}).omit({ followedAt: true });
type MoodlistFollowerSchema = z.infer<typeof moodlistFollowerSchema>;
type SelectMoodlistFollowerModel = InferSelectModel<typeof moodlistFollowers>;

export {
  moodlistFollowers,
  moodlistFollowerSchema,
  moodlists,
  moodlistSchema,
  moodlistSongs,
  moodlistSongSchema,
  moodlistSongsRelations,
  moodlistsRelations,
  moodlistFollowersRelations,
  type MoodlistSchema,
  type SelectMoodlistModel,
  type MoodlistSongSchema,
  type SelectMoodlistSongModel,
  type MoodlistFollowerSchema,
  type SelectMoodlistFollowerModel,
};
