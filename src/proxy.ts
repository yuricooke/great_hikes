import { NextResponse, type NextRequest } from "next/server";

import hikes from "@content/hikes.json";

/**
 * Legacy links → new URLs: CRA `/Hikes`, `/Hikes/<id>` (spec 001, FR-005). Old `/hikes?continent=`
 * links need no redirect any more — /hikes filters by continent itself (2026-10-08).
 * Done here rather than in next.config redirects because those match paths
 * case-insensitively, which would make `/Hikes` → `/hikes` loop.
 */
const LEGACY_IDS = new Map(hikes.map((h) => [String(h.id), h.slug]));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
