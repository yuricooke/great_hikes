/**
 * Sample content (stories, shop items) and demo sign-in are visible in local dev and Vercel
 * previews, never in production, until real content, affiliate links and Supabase Auth exist.
 */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";
export const SHOW_SAMPLES = !IS_PRODUCTION;
export const DEMO_AUTH = !IS_PRODUCTION;
