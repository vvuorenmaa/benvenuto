import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

type AppDatabase = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as { db?: AppDatabase };

function createDb(): AppDatabase {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const sqlite = new Database(path.join(dataDir, "benvenuto.sqlite"));
  const drizzleDb = drizzle(sqlite, { schema });

  migrate(drizzleDb, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });

  return drizzleDb;
}

export const db: AppDatabase = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
