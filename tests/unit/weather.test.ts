import { describe, expect, it } from "vitest";

import { dailyForecast, weatherLabel } from "@/lib/weather";

const entry = (time: string, t: number, symbol?: string) => ({
  time,
  data: { instant: { details: { air_temperature: t } }, ...(symbol ? { next_6_hours: { summary: { symbol_code: symbol } } } : {}) },
});

describe("weather", () => {
  it("groups hourly entries into local days with min/max and the midday symbol", () => {
    const series = [
      entry("2026-10-07T00:00:00Z", 4, "clearsky_night"),
      entry("2026-10-07T06:00:00Z", 6, "fair_day"),
      entry("2026-10-07T12:00:00Z", 14, "rain"),
      entry("2026-10-07T18:00:00Z", 9, "cloudy"),
    ];
    expect(dailyForecast(series, 0)).toEqual([{ date: "2026-10-07", min: 4, max: 14, symbol: "rain" }]);
  });

  it("shifts days by longitude and drops partial days", () => {
    const series = [entry("2026-10-07T03:00:00Z", 10, "fair_day")];
    expect(dailyForecast(series, -120)).toEqual([]);
  });

  it("labels MET Norway symbol codes", () => {
    expect(weatherLabel("lightrainshowers_day")).toBe("Light showers");
    expect(weatherLabel("heavyrainandthunder")).toBe("Thunderstorms");
    expect(weatherLabel(null)).toBe("—");
  });
});
