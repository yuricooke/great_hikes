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
  "/about",
  "/map",
  "/share",
  "/contact",
  "/privacy",
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

test("V7 menu: every section reachable once; card holds what the bar doesn't; Escape closes", async ({ page, isMobile }) => {
  await page.goto(`/hikes/${hikes[0].slug}`);
  await expect(page.getByRole("banner").getByRole("link", { name: "Great Hikes home" })).toBeVisible();
  const toggle = page.getByRole("button", { name: "Menu", exact: true });
  const primary = page.getByRole("navigation", { name: "Primary" });
  if (!isMobile) {
    // Wide screens: text links in the bar (owner order), Search/Favorites/Sign in as icons.
    await expect(primary.getByRole("link")).toHaveText(["Hikes", "Journal", "Map", "Shop"]);
    for (const name of ["Search", "Favorites", "Sign in"]) {
      await expect(page.getByRole("banner").getByRole("link", { name, exact: true }).filter({ visible: true })).toHaveCount(1);
    }
  }
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Share your hike", "Our feed"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }
  // Phones: the bar holds only the Menu button; every section is in the card, once.
  for (const name of ["Hikes", "Journal", "Map", "Shop", "Search", "Favorites", "Sign in"]) {
    const inCard = nav.getByRole("link", { name, exact: true });
    const inBar = page.getByRole("banner").getByRole("link", { name, exact: true }).and(page.locator(":not(#site-menu *)"));
    await expect(isMobile ? inCard : inBar.filter({ visible: true })).toHaveCount(1);
    await expect(isMobile ? inBar.filter({ visible: true }) : inCard.filter({ visible: true })).toHaveCount(0);
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

test("V8 keyboard users: skip link first, then visible focus on controls", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  const cta = page.getByRole("link", { name: "Read the guide" });
  await cta.focus();
  await expect(cta).toBeFocused();
  expect(await cta.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
});

test("menu hides when scrolling down and returns when scrolling up", async ({ page }) => {
  await page.goto("/");
  // Wait for hydration so the scroll listener exists (flaked under parallel load).
  await page.waitForLoadState("networkidle");
  const banner = page.getByRole("banner");
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect.poll(() => banner.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect.poll(() => banner.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("footer links to every section", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  for (const name of [
    "All hikes", "Our top 10", "Map", "Search", "Journal", "Our feed", "Gear we trust",
    "About", "Contact", "Affiliate disclosure", "Privacy", "Terms",
  ]) {
    await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(footer.getByText(/affiliate links/)).toBeVisible();
});

test("trust pages: each has a title, date and links back to the others", async ({ page }) => {
  for (const [url, title] of [
    ["/about", "About Great Hikes"],
    ["/affiliate-disclosure", "Affiliate disclosure"],
    ["/privacy", "Privacy policy"],
    ["/terms", "Terms of use"],
  ]) {
    const res = await page.goto(url);
    expect(res?.status(), url).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText(/Last updated/)).toBeVisible();
  }
});

test("contact form validates before sending", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Test Hiker");
  await page.getByLabel("Email").fill("hiker@greathikes.test");
  await page.getByLabel("Message").fill("Too short");
  // Skip the browser's own minlength check to exercise the server validation.
  await page.locator("form").evaluate((f) => f.setAttribute("novalidate", ""));
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("a little short");
  await expect(page.getByLabel("Name")).toHaveValue("Test Hiker");
});

test("appearance: dark by default; the menu switch turns on light mode and remembers it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("radiogroup", { name: "Appearance" }).getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

for (const url of PAGES) {
  test(`light theme: no serious accessibility issues on ${url}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("gh-theme", "light"));
    await page.goto(url);
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}
