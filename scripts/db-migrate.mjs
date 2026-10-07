/**
 * Applies supabase/migrations/*.sql in name order to the Supabase database.
 * Usage: node scripts/db-migrate.mjs   (reads SUPABASE_POSTGRES_URL_NON_POOLING from .env.local)
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local", quiet: true });
const url = process.env.SUPABASE_POSTGRES_URL_NON_POOLING;
if (!url) throw new Error("SUPABASE_POSTGRES_URL_NON_POOLING missing — run `vercel env pull .env.local`");

const dir = "supabase/migrations";
const client = new pg.Client({ connectionString: url.replace(/[?&]sslmode=[^&]*/, ""), ssl: { rejectUnauthorized: false } });
await client.connect();
for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  await client.query(readFileSync(path.join(dir, file), "utf8"));
  console.log("applied", file);
}
const { rows } = await client.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by 1",
);
console.log("public tables:", rows.map((r) => r.table_name).join(", "));
await client.end();
