import { expect, test } from "@playwright/test";

import hikes from "../../content/hikes.json" with { type: "json" };
import topics from "../../content/topics.json" with { type: "json" };

test("V4 legacy URLs redirect permanently", async ({ request }) => {
  const list = await request.get("/Hikes", { maxRedirects: 0 });
  expect(list.status()).toBe(308);
  expect(list.headers().location).toMatch(/\/hikes$/);
  for (const hike of [hikes[0], hikes[31]]) {
    const res = await request.get(`/Hikes/${hike.id}`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toMatch(new RegExp(`/hikes/${hike.slug}$`));
  }
  expect((await request.get("/Hikes/999")).status()).toBe(404);
  expect((await request.get("/hikes", { maxRedirects: 0 })).status()).toBe(200);
});

test("unknown paths show the branded not-found page", async ({ page }) => {
  const res = await page.goto("/hikes/not-a-trail");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Trail not found" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});

test("V5 hike pages have unique metadata and social previews", async ({ page }) => {
  const hike = hikes[1];
  await page.goto(`/hikes/${hike.slug}`);
  await expect(page).toHaveTitle(`${hike.title} · Great Hikes`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", hike.description);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/hikes/${hike.slug}$`));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(hike.photo.src));
});

test("V6 sitemap lists home, all hikes, every topic and every hike", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = xml.match(/<loc>/g) ?? [];
  expect(locs.length).toBeGreaterThanOrEqual(hikes.length + topics.topics.length + 2);
  for (const path of ["/search", "/journal", "/shop", "/our-feed", "/community"]) expect(xml).toContain(path);
});

test("old continent filter links redirect to topic pages", async ({ request }) => {
  const res = await request.get("/hikes?continent=asia", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toMatch(/\/explore\/asia$/);
  const unknown = await request.get("/hikes?continent=mars", { maxRedirects: 0 });
  expect(unknown.headers().location).toMatch(/\/hikes$/);
  expect((await request.get("/explore/nope")).status()).toBe(404);
});
