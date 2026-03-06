import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "@/db/schema";
import { env } from "@/lib/env";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema,
  // logger: env.NODE_ENV === "development",
  logger: false,
  casing: "snake_case",
});

export type DB = typeof db;
