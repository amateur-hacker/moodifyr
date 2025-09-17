import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./auth";

const userPreferences = pgTable(
  "user_preferences",
  (t) => ({
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: t.text("key").notNull(),
    value: t.text("value").notNull(),
    updatedAt: t.timestamp("searched_at").defaultNow().notNull(),
  }),
  (t) => [
    uniqueIndex("user_preferences_user_id_key_unique").on(t.userId, t.key),
  ],
);

export { userPreferences };
