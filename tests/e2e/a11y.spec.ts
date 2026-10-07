import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import hikes from "../../content/hikes.json" with { type: "json" };

const PAGES = [
  "/",
  "/hikes",
  "/explore/top-10",
  "/search?landscape=mountains",
  "/journal",
  "/journal/planning-the-w-trek",
  "/shop",
  "/our-feed",
  "/favorites",
  "/login",
  `/hikes/${hikes[0].slug}`,
  "/no-such-page",
];

for (const url of PAGES) {
  test(`V9 no serious accessibility issues on ${url}`, async ({ page }) => {
    await page.goto(url);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.length} nodes`)).toEqual([]);
  });

  test(`V7 no horizontal scroll on ${url}`, async ({ page }) => {
    await page.goto(url);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("V7 floating menu opens a card with every section; Escape closes it", async ({ page }) => {
  await page.goto(`/hikes/${hikes[0].slug}`);
  await expect(page.getByRole("link", { name: "Great Hikes home" })).toBeVisible();
  const toggle = page.getByRole("button", { name: "Menu", exact: true });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Home", "Hikes", "Search", "Journal", "Shop", "Community", "Our feed", "Sign in"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: /Instagram/ })).toHaveAttribute("href", /instagram\.com\/great_hikes/);
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("menu never touches the screen edges", async ({ page }) => {
  await page.goto("/");
  const box = (await page.getByRole("banner").boundingBox())!;
  const width = page.viewportSize()!.width;
  expect(box.x).toBeGreaterThanOrEqual(12);
  expect(width - (box.x + box.width)).toBeGreaterThanOrEqual(12);
  expect(box.y).toBeGreaterThanOrEqual(12);
});

test("V8 keyboard users can reach the main call to action with visible focus", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  const cta = page.getByRole("link", { name: "Let's hike!" });
  for (let i = 0; i < 12 && !(await cta.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(cta).toBeFocused();
  const outline = await cta.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});

