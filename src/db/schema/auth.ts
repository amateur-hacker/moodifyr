import { type InferSelectModel, relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type z from "zod";
import {
  favouriteSongs,
  songAnalyticsPlayHistory,
  songPlayHistory,
  songSearchHistory,
} from "./song";

const rolesEnum = pgEnum("role", ["user", "admin"]);

const users = pgTable("users", (t) => ({
  id: t.text().primaryKey().notNull(),
  name: t.text().notNull(),
  email: t.text().notNull().unique(),
  emailVerified: t.boolean().notNull().default(false),
  image: t
    .text()
    .default(
      "https://res.cloudinary.com/ahcloud/image/upload/v1747277562/images/default-profile_bpnjdl_dzyvud.png",
    )
    .notNull(),
  role: rolesEnum().notNull().default("user"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));

const accounts = pgTable("accounts", (t) => ({
  id: t.text().primaryKey().notNull(),
  accountId: t.text().notNull(),
  providerId: t.text().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: t.text(),
  refreshToken: t.text(),
  idToken: t.text(),
  accessTokenExpiresAt: t.timestamp(),
  refreshTokenExpiresAt: t.timestamp(),
  scope: t.text(),
  password: t.text(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));

const sessions = pgTable("sessions", (t) => ({
  id: t.text().primaryKey().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: t.text().notNull().unique(),
  ipAddress: t.text(),
  userAgent: t.text(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));

const verifications = pgTable("verifications", (t) => ({
  id: t.text().primaryKey().notNull(),
  identifier: t.text().notNull(),
  value: t.text().notNull(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));

const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  favouriteSongs: many(favouriteSongs),
  playHistory: many(songPlayHistory),
  analyticsHistory: many(songAnalyticsPlayHistory),
  searchHistory: many(songSearchHistory),
}));

const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

type Role = (typeof rolesEnum.enumValues)[number];

const userSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});
type UserSchema = z.infer<typeof userSchema>;
type SelectUserModel = InferSelectModel<typeof users>;

export {
  users,
  userSchema,
  type UserSchema,
  type SelectUserModel,
  rolesEnum,
  type Role,
  accounts,
  sessions,
  verifications,
  usersRelations,
  accountsRelations,
  sessionsRelations,
};
