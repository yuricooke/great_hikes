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

test("every hike page renders story, facts, credit, map and breadcrumb", async ({ page }) => {
  for (const hike of hikes) {
    const res = await page.goto(`/hikes/${hike.slug}`);
    expect(res?.status(), hike.slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(hike.title);
    await expect(page.getByRole("heading", { name: "The hike" })).toBeVisible();
    await expect(page.getByText(/^Photo( by|:)/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /^(At a glance|Signature route)$/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Plan your trip" })).toBeVisible();
    await expect(page.locator(`iframe[title="Map of ${hike.title}"]`)).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: hike.continent })).toBeVisible();
  }
});

test("instagram-featured hike credits the photographer from the post", async ({ page }) => {
  const featured = hikes.find((h) => h.photo.src.startsWith("https://") && "instagram" in h)!;
  await page.goto(`/hikes/${featured.slug}`);
  await expect(page.getByRole("link", { name: featured.photo.author }).first()).toHaveAttribute("href", featured.photo.sourceUrl!);
});

test("place page lists its trails; a trail page shows map, profile and facts", async ({ page }) => {
  await page.goto("/hikes/yosemite-national-park");
  const trails = page.getByRole("heading", { name: "Trails in Yosemite National Park" });
  await expect(trails).toBeVisible();
  await page.getByRole("group", { name: "Filter trails by difficulty" }).getByRole("button", { name: "Easy" }).click();
  await page.getByRole("link", { name: /Sentinel Dome/ }).first().click();
  await expect(page).toHaveURL("/hikes/yosemite-national-park/sentinel-dome");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sentinel Dome");
  await expect(page.getByRole("region", { name: "Map of Sentinel Dome" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Elevation profile" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Yosemite National Park" })).toBeVisible();
});

test("journal: article page with inline hike card and related rails", async ({ page }) => {
  await page.goto("/journal");
  await expect(page.getByRole("heading", { name: "Our content" })).toBeVisible();
  await page.getByRole("link", { name: /Planning the W Trek/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Planning the W Trek in Torres del Paine");
  await expect(page.getByRole("complementary", { name: /Hike: Torres del Paine/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Hikes in this story" })).toBeVisible();
});

test("shop: categories, sorting and products that open the partner store", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByText(/earns a commission/)).toBeVisible();
  const grid = page.getByRole("list", { name: "Products" });
  const all = await grid.getByRole("listitem").count();
  expect(all).toBeGreaterThan(8);

  await page.getByRole("navigation", { name: "Shop categories" }).getByRole("link", { name: "Socks" }).click();
  await expect(page).toHaveURL(/category=socks/);
  const socks = await grid.getByRole("listitem").count();
  expect(socks).toBeGreaterThan(0);
  expect(socks).toBeLessThan(all);

  await page.getByLabel("Sort").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  const prices = await grid.locator("p").filter({ hasText: "$" }).allTextContents();
  const values = prices.map((t) => Number(t.replace(/[^0-9.]/g, "")));
  expect(values).toEqual([...values].sort((a, b) => a - b));

  const cta = grid.getByRole("link", { name: /^Shop at/ }).first();
  await expect(cta).toHaveAttribute("target", "_blank");
  await expect(cta).toHaveAttribute("rel", /sponsored/);
  await expect(cta).toHaveAttribute("href", /^\/go\//);
});

test("outbound /go links redirect to the partner (samples: back to the shop)", async ({ request }) => {
  const res = await request.get("/go/merino-trail-sock", { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
  expect((await request.get("/go/unknown-product", { maxRedirects: 0 })).headers().location).toMatch(/\/shop$/);
});

test("instagram pages render", async ({ page }) => {
  for (const [url, title] of [["/our-feed", "Our feed"], ["/community", "Our community"]]) {
    const res = await page.goto(url);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  }
});

test("sign in with the test account, save a hike, see it in favorites", async ({ page }, testInfo) => {
  // Each project uses its own account so parallel runs don't share favorites.
  const email = testInfo.project.name === "mobile" ? "owner@greathikes.test" : "hiker@greathikes.test";
  // With Supabase configured, start from an empty favorites list (404 = offline demo mode).
  const reset = await page.request.post("/auth/test-login", { data: { email, reset: true } });
  const real = reset.ok();
  await page.context().clearCookies();

  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Sign in" }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Email").fill("not-an-email");
  await dialog.getByRole("button", { name: "Continue with email" }).click();
  await expect(dialog.getByRole("alert")).toContainText("valid email");
  if (!real) {
    await dialog.getByLabel("Email").fill("someone@example.com");
    await dialog.getByRole("button", { name: "Continue with email" }).click();
    await expect(dialog.getByRole("alert")).toContainText("test accounts");
  }
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByRole("button", { name: "Continue with email" }).click();
  await expect(dialog).toBeHidden();

  const save = page.getByRole("button", { name: `Save ${hikes[0].title} to favorites` }).first();
  const saved = real
    ? page.waitForResponse((r) => r.url().includes("/rest/v1/favorites") && r.request().method() === "POST")
    : Promise.resolve();
  await save.click();
  await saved;
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

test("map: filters narrow the list and a result opens its page", async ({ page }) => {
  await page.goto("/map?lat=37.74&lng=-119.56&z=11.5");
  const list = page.getByRole("list", { name: "Hikes in view" });
  await expect(list.getByRole("listitem").first()).toBeVisible({ timeout: 15000 });
  await page.getByRole("combobox", { name: "Difficulty" }).selectOption("easy");
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await list.getByRole("button", { name: /Sentinel Dome/ }).click();
  await page.getByRole("complementary", { name: "Selected: Sentinel Dome" }).getByRole("link", { name: "Open trail" }).click();
  await expect(page).toHaveURL("/hikes/yosemite-national-park/sentinel-dome");
});
