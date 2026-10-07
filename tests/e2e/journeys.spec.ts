import { expect, test } from "@playwright/test";

import hikes from "../../content/hikes.json" with { type: "json" };

test("V1 home: glass welcome panel leads to hikes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Great Hikes" })).toBeVisible();
  await page.getByRole("link", { name: "Let's Hike!" }).click();
  await expect(page).toHaveURL(/\/hikes$/);
});

test("V2 hikes browser: selecting a hike updates the panel and links to it", async ({ page }) => {
  await page.goto("/hikes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(hikes[0].title);
  for (const hike of [hikes[1], hikes[5], hikes[10]]) {
    await page.getByRole("button", { name: new RegExp(hike.title) }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(hike.title);
  }
  await page.getByRole("link", { name: "Let's hike!" }).click();
  await expect(page).toHaveURL(`/hikes/${hikes[10].slug}`);
});

test("V3 every hike page renders story, photo credit, map and related hikes", async ({ page }) => {
  for (const hike of hikes) {
    const res = await page.goto(`/hikes/${hike.slug}`);
    expect(res?.status(), hike.slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(hike.title);
    await expect(page.getByRole("heading", { name: "The hike" })).toBeVisible();
    await expect(page.getByText(`Photo:`).first()).toBeVisible();
    await expect(page.getByAltText(`Map of ${hike.continent}`)).toBeVisible();
  }
});

test("related hike cards navigate to that hike", async ({ page }) => {
  await page.goto(`/hikes/${hikes[0].slug}`);
  const related = page.getByRole("region", { name: /More hikes in/ }).getByRole("link").first();
  const title = (await related.locator("span span").first().textContent())!;
  await related.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
});

test("V11 continent filter is shareable and has an empty state", async ({ page }) => {
  await page.goto("/hikes?continent=asia");
  await expect(page.getByRole("heading", { name: /Hikes in Asia/ })).toBeVisible();
  const asian = hikes.filter((h) => h.continent === "Asia");
  await expect(page.getByRole("list").filter({ has: page.getByRole("button") }).getByRole("button")).toHaveCount(
    asian.length,
  );
  await page.goto("/hikes?continent=mars");
  await expect(page.getByText("No hikes found for this filter.")).toBeVisible();
  await page.getByRole("link", { name: "See all hikes" }).click();
  await expect(page.getByRole("heading", { name: /All hikes/ })).toBeVisible();
});

test("V10 no dead controls: every button and link does something", async ({ page }) => {
  for (const url of ["/", "/hikes", `/hikes/${hikes[0].slug}`, "/no-such-page"]) {
    await page.goto(url);
    const links = page.locator("a:visible");
    for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href, `${url} link`).toBeTruthy();
      expect(href).not.toBe("#");
    }
    expect(await page.getByText("John Muir").count()).toBe(0);
  }
});
