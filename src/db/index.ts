import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "@/db/schema";
import { env } from "@/lib/env";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// TODO: logger true
export const db = drizzle(pool, { schema, logger: true, casing: "snake_case" });

export type DB = typeof db;
