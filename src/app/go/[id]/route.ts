import { NextResponse, type NextRequest } from "next/server";

import { productById } from "@/lib/products";

/**
 * Outbound affiliate redirect: /go/<product-id> → partner page.
 * Central place for click counting (spec 005: affiliate_clicks table) and link updates.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const product = productById((await params).id);
  const target = product ? new URL(product.url, request.url) : new URL("/shop", request.url);
  const res = NextResponse.redirect(target, 302);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
