import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getServerEnv } from "@/server/config/env";
import * as schema from "@/server/db/schema";

let pool: Pool | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: getServerEnv().databaseUrl,
      max: 5,
    });
  }

  if (!database) {
    database = drizzle(pool, { schema });
  }

  return database;
}
