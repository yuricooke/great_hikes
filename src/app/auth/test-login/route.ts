import { NextResponse, type NextRequest } from "next/server";

import testUsers from "../../../../fixtures/test-users.json";
import { IS_PRODUCTION, SUPABASE_CONFIGURED } from "@/lib/flags";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

/**
 * Preview/local only: signs in one of the seeded test accounts without email
 * (fixtures/test-users.json). Returns 404 in production. `reset` clears its favorites, reviews, tips and submissions (tests).
 */
export async function POST(request: NextRequest) {
  if (IS_PRODUCTION || !SUPABASE_CONFIGURED) return new NextResponse(null, { status: 404 });
  const { email, reset } = (await request.json().catch(() => ({}))) as { email?: string; reset?: boolean };
  const account = testUsers.users.find((u) => u.email === email?.trim().toLowerCase());
  if (!account) return NextResponse.json({ error: "Not a test account" }, { status: 400 });

  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: account.email });
  if (error || !data.properties?.hashed_token) {
    return NextResponse.json({ error: "Could not create a test session" }, { status: 500 });
  }
  const supabase = await supabaseServer();
  const { data: session, error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: data.properties.hashed_token,
  });
  if (verifyError || !session.user) return NextResponse.json({ error: "Could not sign in" }, { status: 500 });

  if (reset) {
    // Test accounts only: clear everything they created in earlier runs.
    const uid = session.user.id;
    await Promise.all(["favorites", "reviews", "tips", "submissions"].map((t) => admin.from(t).delete().eq("user_id", uid)));
  }
  return NextResponse.json({ ok: true });
}
