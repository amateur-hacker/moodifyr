import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";

const rolesEnum = pgEnum("role", ["user", "admin"]);

const users = pgTable("users", (t) => ({
  id: t.text().primaryKey(),
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
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
}));

const accounts = pgTable("accounts", (t) => ({
  id: t.text().primaryKey(),
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
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
}));

const sessions = pgTable("sessions", (t) => ({
  id: t.text().primaryKey(),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: t.text().notNull().unique(),
  ipAddress: t.text(),
  userAgent: t.text(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
}));

const verifications = pgTable("verifications", (t) => ({
  id: t.text().primaryKey(),
  identifier: t.text().notNull(),
  value: t.text().notNull(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().notNull(),
}));

const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
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
type SelectUsers = typeof users.$inferSelect;
type InsertUsers = typeof users.$inferInsert;
type SelectAccounts = typeof accounts.$inferSelect;
type InsertAccounts = typeof accounts.$inferInsert;
type SelectSessions = typeof sessions.$inferSelect;
type InsertSessions = typeof sessions.$inferInsert;

export {
  users,
  rolesEnum,
  accounts,
  sessions,
  verifications,
  usersRelations,
  accountsRelations,
  sessionsRelations,
  type Role,
  type SelectUsers,
  type InsertUsers,
  type SelectAccounts,
  type InsertAccounts,
  type SelectSessions,
  type InsertSessions,
};
