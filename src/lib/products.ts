import { z } from "zod";

import rawProducts from "@content/products.json";

import { SHOW_SAMPLES } from "./flags";

/**
 * Shop catalog. Products will come from affiliate network feeds (e.g. AvantLink) which provide
 * licensed images, prices and tracking links; until then the catalog holds labeled samples
 * that never appear in production.
 */
const CategoryKey = z.enum(["apparel", "jackets", "socks", "footwear", "backpacks", "tents", "climbing", "accessories"]);

const ProductSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  status: z.enum(["published", "sample"]),
  category: CategoryKey,
  name: z.string(),
  brand: z.string(),
  price: z.number().positive(),
  currency: z.literal("USD"),
  retailer: z.string(),
  /** Licensed image from the partner feed; null shows a category placeholder. */
  image: z.url().nullable(),
  /** Affiliate (tracking) URL, or an internal path for samples. */
  url: z.string().refine((u) => u.startsWith("https://") || u.startsWith("/")),
  featured: z.boolean(),
});

const CatalogSchema = z.object({
  disclosure: z.string(),
  categories: z.array(z.object({ key: CategoryKey, label: z.string() })),
  products: z.array(ProductSchema),
  /** When prices were last refreshed from the feeds (shown next to prices). */
  updated: z.string(),
});

const CATALOG = CatalogSchema.parse(rawProducts);

export type Product = z.infer<typeof ProductSchema>;
export type CategoryKey = z.infer<typeof CategoryKey>;

export function products(): Product[] {
  return CATALOG.products.filter((p) => SHOW_SAMPLES || p.status === "published");
}

export function productById(id: string): Product | undefined {
  return CATALOG.products.find((p) => p.id === id && (SHOW_SAMPLES || p.status === "published"));
}

export function shopCategories() {
  return CATALOG.categories;
}

export function shopDisclosure() {
  return CATALOG.disclosure;
}

export function pricesUpdated() {
  return CATALOG.updated;
}

/** Outbound links go through /go/<id> so clicks can be counted and URLs swapped in one place. */
export function outboundPath(p: Pick<Product, "id">) {
  return `/go/${p.id}`;
}
