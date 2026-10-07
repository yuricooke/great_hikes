import { expect, test } from "@playwright/test";

import hikes from "../../content/hikes.json" with { type: "json" };
import topics from "../../content/topics.json" with { type: "json" };

test("landing: today's feature hero with date leads to its hike", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("region", { name: /./ }).filter({ has: page.locator("#featured-title") }).first();
  await expect(page.getByText("Today's feature")).toBeVisible();
  await expect(page.locator("time").first()).toHaveText(/\d{4}/);
  const title = (await page.locator("#featured-title").textContent())!;
  await page.getByRole("link", { name: "Let's hike!" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  expect(card).toBeTruthy();
});

test("landing sections appear in the requested order", async ({ page }) => {
  await page.goto("/");
  const titles = await page.locator("main h2").allTextContents();
  const order = ["Our top 10 for you", "Our content", "Shop", "Explore by", "Hikers' experiences"];
  const positions = order.map((t) => titles.indexOf(t));
  expect(positions.every((p) => p >= 0), titles.join(" | ")).toBe(true);
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
});

test("rail arrows scroll the cards on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "arrows are a pointer-device control");
  await page.goto("/");
  const rail = page.getByRole("region", { name: "Our top 10 for you" });
  const list = rail.getByRole("list");
  const prev = rail.getByRole("button", { name: /Previous/ });
  await expect(prev).toBeDisabled();
  await rail.getByRole("button", { name: /Next/ }).click();
  await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(prev).toBeEnabled();
});

test("explore-by tags open search with the filter applied", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "Explore by" }).getByRole("link", { name: "Waterfalls & lakes" }).click();
  await expect(page).toHaveURL(/\/search\?landscape=waterfalls$/);
  const expected = hikes.filter((h) => h.landscapes.includes("waterfalls")).length;
  await expect(page.getByRole("list", { name: "Hikes" }).getByRole("listitem")).toHaveCount(expected);
  await page.getByRole("navigation", { name: "Filter by continent" }).getByRole("link", { name: "Asia" }).click();
  const both = hikes.filter((h) => h.landscapes.includes("waterfalls") && h.continent === "Asia").length;
  await expect(page.getByRole("list", { name: "Hikes" }).getByRole("listitem")).toHaveCount(both);
});

test("search by text", async ({ page }) => {
  await page.goto("/search?q=patagonia");
  await expect(page.getByRole("list", { name: "Hikes" })).toBeVisible();
  await page.goto("/search?q=zzzz");
  await expect(page.getByText("No hikes match these filters yet.")).toBeVisible();
});

test("topic pages show a grid; top 10 is ranked", async ({ page }) => {
  await page.goto("/explore/top-10");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our top 10");
  const top = topics.topics.find((t) => t.slug === "top-10")!.hikes!;
  const cards = page.getByRole("list", { name: "Hikes" }).getByRole("listitem");
  await expect(cards).toHaveCount(10);
  await expect(cards.first()).toContainText("#1");
  await cards.first().getByRole("link").first().click();
  await expect(page).toHaveURL(`/hikes/${top[0]}`);
});

test("every hike page renders story, credit, map and breadcrumb", async ({ page }) => {
  for (const hike of hikes) {
    const res = await page.goto(`/hikes/${hike.slug}`);
    expect(res?.status(), hike.slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(hike.title);
    await expect(page.getByRole("heading", { name: "The hike" })).toBeVisible();
    await expect(page.getByText("Photo:").first()).toBeVisible();
    await expect(page.getByAltText(`Map of ${hike.continent}`)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: hike.continent })).toBeVisible();
  }
});

test("journal: article page with inline hike card and related rails", async ({ page }) => {
  await page.goto("/journal");
  await expect(page.getByRole("heading", { name: "Our content" })).toBeVisible();
  await page.getByRole("link", { name: /Planning the W Trek/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Planning the W Trek in Torres del Paine");
  await expect(page.getByRole("complementary", { name: /Hike: Torres del Paine/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Hikes in this story" })).toBeVisible();
});

test("shop shows partner categories with a disclosure, opening in a new tab", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByText(/affiliate links/)).toBeVisible();
  const first = page.getByRole("list").filter({ has: page.locator("a[target=_blank]") }).getByRole("link").first();
  await expect(first).toHaveAttribute("target", "_blank");
  expect(await page.locator("a[href*='rei.com']").count()).toBe(0);
});

test("instagram pages render", async ({ page }) => {
  for (const [url, title] of [["/our-feed", "Our feed"], ["/community", "Our community"]]) {
    const res = await page.goto(url);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  }
});

test("sign in with the test account, save a hike, see it in favorites", async ({ page, isMobile }) => {
  await page.goto("/");
  expect(isMobile !== undefined).toBe(true);
  await page.getByRole("banner").getByRole("link", { name: "Sign in" }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Email").fill("someone@example.com");
  await dialog.getByRole("button", { name: "Continue with email" }).click();
  await expect(dialog.getByRole("alert")).toContainText("test accounts");
  await dialog.getByLabel("Email").fill("hiker@greathikes.test");
  await dialog.getByRole("button", { name: "Continue with email" }).click();
  await expect(dialog).toBeHidden();

  const save = page.getByRole("button", { name: `Save ${hikes[0].title} to favorites` }).first();
  await save.click();
  await page.goto("/favorites");
  await expect(page.getByRole("list", { name: "Hikes" }).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText(hikes[0].title).first()).toBeVisible();
});

test("direct visit to /login shows the full sign-in page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("no dead links and no placeholder review", async ({ page }) => {
  for (const url of ["/", "/hikes", "/explore/top-10", "/journal", "/shop", `/hikes/${hikes[0].slug}`, "/no-such-page"]) {
    await page.goto(url);
    const hrefs = await page.locator("a:visible").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    for (const href of hrefs) {
      expect(href, url).toBeTruthy();
      expect(href).not.toBe("#");
    }
    expect(await page.getByText("John Muir").count()).toBe(0);
  }
});
