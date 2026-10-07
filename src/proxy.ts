import { NextResponse, type NextRequest } from "next/server";

import hikes from "@content/hikes.json";

/**
 * Legacy links → new URLs: CRA `/Hikes`, `/Hikes/<id>` (spec 001, FR-005) and
 * `/hikes?continent=` filters (spec 002, FR-009).
 * Done here rather than in next.config redirects because those match paths
 * case-insensitively, which would make `/Hikes` → `/hikes` loop.
 */
const LEGACY_IDS = new Map(hikes.map((h) => [String(h.id), h.slug]));
const CONTINENT_KEYS = new Set(["africa", "asia", "europe", "north-america", "oceania", "south-america"]);

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Spec 001 filter links (/hikes?continent=asia) → continent topic pages (spec 002).
  if (pathname === "/hikes" && searchParams.has("continent")) {
    const key = searchParams.get("continent") ?? "";
    const target = CONTINENT_KEYS.has(key) ? `/explore/${key}` : "/hikes";
    return NextResponse.redirect(new URL(target, request.url), 308);
  }

  if (pathname !== "/Hikes" && !pathname.startsWith("/Hikes/")) return NextResponse.next();

  const id = pathname.slice("/Hikes/".length);
  const slug = LEGACY_IDS.get(id);
  const destination = pathname === "/Hikes" || pathname === "/Hikes/" ? "/hikes" : slug ? `/hikes/${slug}` : null;
  if (!destination) return NextResponse.next(); // unknown id → normal 404

  return NextResponse.redirect(new URL(destination, request.url), 308);
}

export const config = {
  matcher: ["/Hikes", "/Hikes/:path*", "/hikes"],
};
