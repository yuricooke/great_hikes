import { z } from "zod";

import rawShop from "@content/shop.json";

import { SHOW_SAMPLES } from "./flags";
import { hikeBySlug } from "./hikes";

const ShopSchema = z.object({
  disclosure: z.string(),
  categories: z.array(
    z.object({
      slug: z.string(),
      status: z.enum(["published", "sample"]),
      title: z.string(),
      text: z.string(),
      image: z.string(),
      partner: z.string(),
      url: z.url(),
    }),
  ),
});

const SHOP = ShopSchema.parse(rawShop);
for (const c of SHOP.categories) if (!hikeBySlug(c.image)) throw new Error(`Shop ${c.slug}: unknown image hike ${c.image}`);

export type ShopCategory = (typeof SHOP.categories)[number];

/** Sample categories (no affiliate IDs yet) are hidden in production. */
export function shopCategories(): ShopCategory[] {
  return SHOP.categories.filter((c) => SHOW_SAMPLES || c.status === "published");
}

export function shopDisclosure() {
  return SHOP.disclosure;
}
