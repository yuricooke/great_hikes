/**
 * Creates the test accounts from fixtures/test-users.json in Supabase Auth (idempotent).
 * They have no password; previews sign them in through /auth/test-login (never in production).
 * Usage: node scripts/seed-test-users.mjs
 */
import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Supabase URL/service key missing — run `vercel env pull .env.local`");

const admin = createClient(url, key, { auth: { persistSession: false } });
const { users } = JSON.parse(readFileSync("fixtures/test-users.json", "utf8"));
const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 });

for (const u of users) {
  let user = existing.users.find((x) => x.email === u.email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      email_confirm: true,
      user_metadata: { name: u.name, test_account: true },
    });
    if (error) throw error;
    user = data.user;
    console.log("created", u.email);
  } else {
    console.log("exists ", u.email);
  }
  const { error } = await admin.from("profiles").upsert({ id: user.id, display_name: u.name, role: u.role });
  if (error) throw error;
}
