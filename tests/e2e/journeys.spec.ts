import { expect, test } from "@playwright/test";

import hikes from "../../content/hikes.json" with { type: "json" };
import topics from "../../content/topics.json" with { type: "json" };

test("landing: today's read is a dated journal guide that opens the article", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Today's read")).toBeVisible();
  await expect(page.locator("time").first()).toHaveText(/\d{4}/);
  const title = (await page.locator("#featured-title").textContent())!;
  await page.getByRole("link", { name: "Read the guide" }).click();
  await expect(page).toHaveURL(/\/journal\//);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
});

test("landing sections appear in the requested order", async ({ page }) => {
  await page.goto("/");
  const titles = await page.locator("main h2").allTextContents();
  // Owner order 2026-10-08 (community rail needs Instagram/approved photos, so it's optional here).
  const order = ["Our top 10 for you", "Recently added", "For your hikes — Journal", "Explore by", "Shop"];
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

test("explore-by dropdowns filter the landing grid; tags remove filters; see all keeps them", async ({ page }) => {
  await page.goto("/");
  const explore = page.getByRole("region", { name: "Explore by" });
  await expect(explore.getByText("Around the world")).toBeVisible();
  await explore.getByRole("combobox", { name: "Landscape" }).selectOption("waterfalls");
  const expected = hikes.filter((h) => h.landscapes.includes("waterfalls")).length;
  await expect(explore.getByText(`${expected} hikes match`)).toBeVisible();
  await expect(explore.getByRole("list", { name: "Active filters" }).getByRole("button", { name: /Waterfalls & lakes/ })).toBeVisible();
  await explore.getByRole("link", { name: /See all/ }).click();
  await expect(page).toHaveURL(/\/hikes\?landscape=waterfalls$/);
  await expect(page.getByRole("list", { name: "Hikes" }).getByRole("listitem")).toHaveCount(expected);
  await page.getByRole("combobox", { name: "Continent" }).selectOption("asia");
  await expect(page).toHaveURL(/landscape=waterfalls&continent=asia/);
  const both = hikes.filter((h) => h.landscapes.includes("waterfalls") && h.continent === "Asia").length;
  await expect(page.getByRole("list", { name: "Hikes" }).getByRole("listitem")).toHaveCount(both);
  await page.getByRole("list", { name: "Active filters" }).getByRole("button", { name: /Asia/ }).click();
  await expect(page).toHaveURL(/\/hikes\?landscape=waterfalls$/);
});

test("search finds hikes and journal guides together", async ({ page }) => {
  await page.goto("/search?q=torres");
  await expect(page.getByRole("list", { name: "Hikes" }).getByRole("listitem").first()).toContainText("Torres del Paine");
  await expect(page.getByRole("list", { name: "Articles" }).getByRole("link", { name: /W Trek/ }).first()).toBeVisible();
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
  test.setTimeout(120_000); // one visit per hike, and the list keeps growing
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
  await page.getByRole("navigation", { name: "Filter by type" }).getByRole("link", { name: "Guides" }).click();
  await expect(page).toHaveURL(/\/journal\?kind=guide$/);
  await page.getByRole("link", { name: /Planning the W Trek/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Planning the W Trek in Torres del Paine");
  // Mid-article hike cards were replaced by one gear promo (ad or gear picks); hikes are listed at the end.
  await expect(page.getByRole("complementary", { name: "Gear for this hike" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Hikes in this story", exact: true })).toBeVisible();
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

test("our feed renders; the #great_hikes hashtag page redirects to it (owner policy)", async ({ page }) => {
  const res = await page.goto("/our-feed");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our feed");
  await page.goto("/community");
  await expect(page).toHaveURL(/\/our-feed$/);
});

test("sign in with the test account, save a hike, see it in favorites", async ({ page }, testInfo) => {
  // Each project uses its own account so parallel runs don't share favorites.
  const email = testInfo.project.name === "mobile" ? "owner@greathikes.test" : "hiker@greathikes.test";
  // With Supabase configured, start from an empty favorites list (404 = offline demo mode).
  const reset = await page.request.post("/auth/test-login", { data: { email, reset: true } });
  const real = reset.ok();
  await page.context().clearCookies();

  await page.goto("/");
  // Phones keep Sign in inside the menu card.
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("banner").getByRole("link", { name: "Sign in" }).filter({ visible: true }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Email").fill("not-an-email");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("valid email");
  if (!real) {
    await dialog.getByLabel("Email").fill("someone@example.com");
    await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText("test accounts");
  }
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
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

test("sign-in form switches to create account and forgot password", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await page.getByLabel("Your name").fill("New Hiker");
  await page.getByLabel("Email").fill("new.hiker@example.com");
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("10 characters");
  await page.getByRole("button", { name: "Sign in", exact: true }).first().click();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
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
  await page.waitForLoadState("networkidle"); // filters work once the page has hydrated
  await page.getByRole("combobox", { name: "Difficulty" }).selectOption("easy");
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await list.getByRole("button", { name: /Sentinel Dome/ }).click();
  await page.getByRole("complementary", { name: "Selected: Sentinel Dome" }).getByRole("link", { name: "Open trail" }).click();
  await expect(page).toHaveURL("/hikes/yosemite-national-park/sentinel-dome");
});

test("reviews & tips: a member posts a review and a tip, then deletes them", async ({ page }, testInfo) => {
  const email = testInfo.project.name === "mobile" ? "owner@greathikes.test" : "hiker@greathikes.test";
  const login = await page.request.post("/auth/test-login", { data: { email } });
  test.skip(!login.ok(), "Needs Supabase (local/preview)");
  const trail = testInfo.project.name === "mobile" ? "mist-trail" : "four-mile-trail";
  await page.goto(`/hikes/yosemite-national-park/${trail}`);
  const section = page.locator("section", { has: page.getByRole("heading", { name: "Reviews & tips" }) });
  await expect(section.getByRole("heading", { name: "Write a review" })).toBeVisible({ timeout: 15000 });

  const text = `E2E ${testInfo.project.name} ${Date.now()} — steep but worth every step.`;
  await section.getByRole("radio", { name: "4 stars" }).check();
  await section.getByLabel("Your review").fill(text);
  await section.getByRole("checkbox").check();
  await section.getByRole("button", { name: "Post review" }).click();
  await expect(section.getByText(text)).toBeVisible();

  const tip = `E2E tip ${Date.now()}: refill at the trailhead.`;
  await section.getByLabel("Your tip").fill(tip);
  await section.getByRole("button", { name: "Add tip" }).click();
  await expect(section.getByText(tip)).toBeVisible();

  page.on("dialog", (d) => d.accept());
  await section.getByRole("listitem").filter({ hasText: text }).getByRole("button", { name: "Delete" }).click();
  await expect(section.getByText(text)).toHaveCount(0);
  await section.locator("dd", { hasText: tip }).getByRole("button", { name: "Delete" }).click();
  await expect(section.getByText(tip)).toHaveCount(0);
});
