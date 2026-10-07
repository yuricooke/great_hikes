import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it.each([
    ["Torres del Paine National Park", "torres-del-paine-national-park"],
    ["  Mount Kilimanjaro  ", "mount-kilimanjaro"],
    ["Tsé Biiʼ Nidzisgaii", "tse-bii-nidzisgaii"],
    ["Inca Trail / Machu Picchu", "inca-trail-machu-picchu"],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});
