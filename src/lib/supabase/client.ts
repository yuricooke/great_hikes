import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (public URL + publishable/anon key only). Null when not configured. */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
