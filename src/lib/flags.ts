/**
 * Sample content (stories, shop items) is visible in local dev and Vercel previews, never in
 * production, until real content and affiliate links exist.
 */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";
export const SHOW_SAMPLES = !IS_PRODUCTION;
/**
 * Shop placeholders (sample products, clearly labelled "Sample") can be switched on in production
 * for testing with SHOW_SHOP_SAMPLES=1 — until partner feeds (spec 006) supply real products.
 */
export const SHOW_SHOP_SAMPLES = SHOW_SAMPLES || process.env.SHOW_SHOP_SAMPLES === "1";

/** Supabase public settings present (Vercel env / .env.local). */
export const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * Real sign-in goes live in production only after the Supabase redirect URLs are set
 * (Authentication → URL Configuration); otherwise email links would point at localhost.
 */
export const AUTH_IN_PRODUCTION = process.env.AUTH_LIVE === "1";
/** Google button appears once the Google provider is enabled in Supabase. */
export const GOOGLE_AUTH = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";

export const AUTH_MODE: "supabase" | "demo" | "off" = SUPABASE_CONFIGURED
  ? IS_PRODUCTION && !AUTH_IN_PRODUCTION
    ? "off"
    : "supabase"
  : IS_PRODUCTION
    ? "off"
    : "demo";

/** Seeded test accounts sign in without email — local dev and previews only. */
export const TEST_LOGIN = !IS_PRODUCTION;
