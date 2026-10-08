import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Landing point of email links (confirm sign-up, reset password) and Google sign-in:
 * turns the code or token in the URL into a session cookie, then continues to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/favorites";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/favorites";

  const supabase = await supabaseServer();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/account/password" : safeNext, origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", origin));
}
