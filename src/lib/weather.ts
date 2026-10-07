import { SITE_URL } from "./site";

/**
 * Short forecast for a hike from MET Norway's Locationforecast API (free, commercial use allowed,
 * CC BY 4.0 — credit "MET Norway"). Requests must identify the site; results are cached for an hour.
 */
export type DayForecast = { date: string; min: number; max: number; symbol: string | null };

type Entry = {
  time: string;
  data: {
    instant: { details: { air_temperature?: number } };
    next_6_hours?: { summary: { symbol_code: string } };
    next_12_hours?: { summary: { symbol_code: string } };
  };
};

const LABELS: Record<string, string> = {
  clearsky: "Clear",
  fair: "Mostly clear",
  partlycloudy: "Partly cloudy",
  cloudy: "Cloudy",
  fog: "Fog",
  rain: "Rain",
  lightrain: "Light rain",
  heavyrain: "Heavy rain",
  rainshowers: "Showers",
  lightrainshowers: "Light showers",
  heavyrainshowers: "Heavy showers",
  sleet: "Sleet",
  snow: "Snow",
  lightsnow: "Light snow",
  heavysnow: "Heavy snow",
  snowshowers: "Snow showers",
  thunder: "Thunderstorms",
};

/** "lightrainshowers_day" → "Light showers"; anything with "thunder" → "Thunderstorms". */
export function weatherLabel(symbol: string | null): string {
  if (!symbol) return "—";
  const base = symbol.replace(/_(day|night|polartwilight)$/, "");
  if (base.includes("thunder")) return LABELS.thunder;
  return LABELS[base] ?? base.replace(/(and|showers)/g, " $1").trim();
}

/** Groups the hourly series into local days (approximated from longitude) — pure, unit-tested. */
export function dailyForecast(series: Entry[], lng: number, days = 5): DayForecast[] {
  const offsetMs = Math.round(lng / 15) * 3_600_000;
  const byDay = new Map<string, { temps: number[]; symbol: string | null; noonGap: number }>();
  for (const entry of series) {
    const local = new Date(Date.parse(entry.time) + offsetMs);
    const date = local.toISOString().slice(0, 10);
    const day = byDay.get(date) ?? { temps: [], symbol: null, noonGap: Infinity };
    const t = entry.data.instant.details.air_temperature;
    if (typeof t === "number") day.temps.push(t);
    const symbol = entry.data.next_6_hours?.summary.symbol_code ?? entry.data.next_12_hours?.summary.symbol_code;
    const gap = Math.abs(local.getUTCHours() - 12);
    if (symbol && gap < day.noonGap) {
      day.symbol = symbol;
      day.noonGap = gap;
    }
    byDay.set(date, day);
  }
  return [...byDay.entries()]
    .filter(([, d]) => d.temps.length >= 4)
    .slice(0, days)
    .map(([date, d]) => ({
      date,
      min: Math.round(Math.min(...d.temps)),
      max: Math.round(Math.max(...d.temps)),
      symbol: d.symbol,
    }));
}

export async function forecast(lat: number, lng: number): Promise<DayForecast[]> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `GreatHikes/1.0 ${SITE_URL}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { properties?: { timeseries?: Entry[] } };
    return dailyForecast(json.properties?.timeseries ?? [], lng);
  } catch {
    return [];
  }
}
