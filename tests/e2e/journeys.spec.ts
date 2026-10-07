import { expect, test } from "@playwright/test";

import hikes from "../../content/hikes.json" with { type: "json" };
import topics from "../../content/topics.json" with { type: "json" };

test("V1 landing: today's feature hero leads to its hike page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Today's feature")).toBeVisible();
  const title = (await page.locator("#featured-title").textContent())!;
  await page.getByRole("link", { name: "Let's hike!" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
});

test("landing shows the topic rails in order with See all links", async ({ page }) => {
  await page.goto("/");
  const railTitles = await page.locator("section[aria-labelledby$='-heading'] h2").allTextContents();
  expect(railTitles).toEqual([
    "Our top 10",
    "Mountains & peaks",
    "Forests & jungles",
    "Coasts & islands",
    "Waterfalls & lakes",
    "Savannas & dunes",
    "Explore by continent",
  ]);
  const top10 = page.getByRole("region", { name: "Our top 10" });
  await expect(top10.getByText("#1", { exact: true })).toBeVisible();
  await top10.getByRole("link", { name: /See all/ }).click();
  await expect(page).toHaveURL(/\/explore\/top-10$/);
});

test("rail arrows scroll the cards on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "arrows are a pointer-device control");
  await page.goto("/");
  const rail = page.getByRole("region", { name: "Mountains & peaks" });
  const list = rail.getByRole("list");
  const prev = rail.getByRole("button", { name: /Previous/ });
  await expect(prev).toBeDisabled();
  await rail.getByRole("button", { name: /Next/ }).click();
  await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(prev).toBeEnabled();
});

test("V3 topic pages show a grid; top 10 is ranked", async ({ page }) => {
  await page.goto("/explore/top-10");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our top 10");
  const top = topics.topics.find((t) => t.slug === "top-10")!.hikes!;
  const cards = page.getByRole("list", { name: "Hikes" }).getByRole("link");
  await expect(cards).toHaveCount(10);
  await expect(cards.first()).toContainText("#1");
  await cards.first().click();
  await expect(page).toHaveURL(`/hikes/${top[0]}`);
});

test("continent topic page lists only that continent", async ({ page }) => {
  await page.goto("/explore/south-america");
  const expected = hikes.filter((h) => h.continent === "South America").length;
  await expect(page.getByRole("list", { name: "Hikes" }).getByRole("link")).toHaveCount(expected);
});

test("every hike page renders story, credit, map and breadcrumb", async ({ page }) => {
  for (const hike of hikes) {
    const res = await page.goto(`/hikes/${hike.slug}`);
    expect(res?.status(), hike.slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(hike.title);
    await expect(page.getByRole("heading", { name: "The hike" })).toBeVisible();
    await expect(page.getByText("Photo:").first()).toBeVisible();
    await expect(page.getByAltText(`Map of ${hike.continent}`)).toBeVisible();
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("link", { name: hike.continent })).toBeVisible();
  }
});

test("all hikes page shows every hike and topic shortcuts", async ({ page }) => {
  await page.goto("/hikes");
  await expect(page.getByRole("main").getByRole("listitem").getByRole("link", { name: /·/ })).toHaveCount(
    hikes.length,
  );
  await page.getByRole("navigation", { name: "Topics" }).getByRole("link", { name: "Coasts & islands" }).click();
  await expect(page).toHaveURL(/\/explore\/coasts$/);
});

test("V10 no dead controls and no placeholder review", async ({ page }) => {
  for (const url of ["/", "/hikes", "/explore/top-10", `/hikes/${hikes[0].slug}`, "/no-such-page"]) {
    await page.goto(url);
    const hrefs = await page.locator("a:visible").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    for (const href of hrefs) {
      expect(href, url).toBeTruthy();
      expect(href).not.toBe("#");
    }
    expect(await page.getByText("John Muir").count()).toBe(0);
  }
});
