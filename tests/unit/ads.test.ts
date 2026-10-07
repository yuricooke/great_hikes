import { describe, expect, it } from "vitest";

import { pickAd } from "@/lib/ads";
import { hikeBySlug } from "@/lib/hikes";

describe("ad targeting", () => {
  it("prefers the ad targeted at the hike", () => {
    expect(pickAd("hike", { hikes: [hikeBySlug("torres-del-paine-national-park")!] })?.id).toBe("rain-shell-patagonia-weather");
  });

  it("matches landscape for waterfall hikes", () => {
    expect(pickAd("hike", { hikes: [hikeBySlug("plitvice-lakes-national-park")!] })?.id).toBe("waterproof-boots-waterfalls");
  });

  it("matches shop category and can skip ads already shown", () => {
    expect(pickAd("shop", { category: "tents" })?.id).toBe("tents-coast");
    expect(pickAd("shop", { category: "tents" }, ["tents-coast"])?.id).not.toBe("tents-coast");
  });
});
