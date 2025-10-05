import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { users } from "./auth";

const userPreferences = pgTable(
  "user_preferences",
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey().notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: t.text().notNull(),
    value: t.text().notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [
    uniqueIndex("user_preferences_user_id_key_unique").on(t.userId, t.key),
  ],
);

const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

const userPreferenceSchema = createInsertSchema(userPreferences, {
  id: z.uuid().min(1),
  value: z
    .union([
      z.string(),
      z.record(z.string(), z.string().or(z.number()).or(z.boolean())),
    ])
    .transform((val) =>
      typeof val === "object" && !Array.isArray(val)
        ? JSON.stringify(val)
        : String(val),
    ),
}).omit({
  createdAt: true,
  updatedAt: true,
});
type UserPreferenceSchema = z.infer<typeof userPreferenceSchema>;
type SelectUserPreferenceModel = InferSelectModel<typeof userPreferences>;

export {
  userPreferences,
  userPreferencesRelations,
  userPreferenceSchema,
  type UserPreferenceSchema,
  type SelectUserPreferenceModel,
};
