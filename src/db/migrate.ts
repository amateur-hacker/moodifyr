import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import config from "$/drizzle.config";

const { Pool } = pg;

import { env } from "@/lib/env";
console.log(env.DATABASE_URL);

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  if (config.out) {
    await migrate(db, { migrationsFolder: config.out });
    console.log("Migration done!");
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    pool.end();
  });
