import Image from "next/image";

import type { Post } from "@/lib/instagram";
import type { Hike, HikeDetails } from "@/lib/schema";
import { weatherLabel, type DayForecast } from "@/lib/weather";
import styles from "./HikeInfo.module.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DIFFICULTY = { easy: "Easy", moderate: "Moderate", challenging: "Challenging", strenuous: "Strenuous" };
const ROUTE = { loop: "Loop", "out-and-back": "Out and back", "point-to-point": "One way", network: "Several trails" };

const km = (n: number) => `${n.toLocaleString("en-US")} km`;
const m = (n: number) => `${n.toLocaleString("en-US")} m`;
const mi = (n: number) => `${(n * 0.621371).toFixed(n < 16 ? 1 : 0)} mi`;
const ft = (n: number) => `${Math.round(n * 3.28084).toLocaleString("en-US")} ft`;

/** "Nov–Mar" style ranges from a month list, wrapping around the year end. */
export function monthRanges(months: number[]): string {
  const set = new Set(months);
  if (set.size === 12) return "All year";
  // Start each range at a month whose previous month is not included.
  const starts = [...set].filter((mo) => !set.has(((mo + 10) % 12) + 1)).sort((a, b) => a - b);
  return starts
    .map((start) => {
      let end = start;
      while (set.has((end % 12) + 1)) end = (end % 12) + 1;
      return start === end ? MONTHS[start - 1] : `${MONTHS[start - 1]}–${MONTHS[end - 1]}`;
    })
    .join(", ");
}

/** Headline numbers for the signature route — metric first, imperial for US readers. */
export function HikeFacts({ details }: { details: HikeDetails }) {
  const facts: [string, string, string?][] = [];
  if (details.distanceKm) facts.push(["Distance", km(details.distanceKm), mi(details.distanceKm)]);
  if (details.elevationGainM) facts.push(["Elevation gain", m(details.elevationGainM), ft(details.elevationGainM)]);
  if (details.maxAltitudeM) facts.push(["Highest point", m(details.maxAltitudeM), ft(details.maxAltitudeM)]);
  facts.push(["Time", details.duration]);
  facts.push(["Difficulty", DIFFICULTY[details.difficulty]]);
  facts.push(["Route", ROUTE[details.routeType]]);
  return (
    <div>
      <p className={styles.route}>{details.route}</p>
      <dl className={styles.facts}>
        {facts.map(([label, value, alt]) => (
          <div key={label} className={styles.fact}>
            <dt>{label}</dt>
            <dd>
              {value}
              {alt && <span className={styles.alt}> · {alt}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Twelve-month strip with the best months highlighted (text alternative included). */
export function SeasonBar({ months }: { months: number[] }) {
  const best = new Set(months);
  return (
    <div className={styles.season}>
      <p className={styles.seasonText}>Best months: {monthRanges(months)}</p>
      <ol className={styles.months} aria-hidden="true">
        {MONTHS.map((label, i) => (
          <li key={label} className={best.has(i + 1) ? styles.best : undefined} title={MONTH_NAMES[i]}>
            {label[0]}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** OpenStreetMap embed (no key, no tracking) plus links to open the spot in map apps. */
export function HikeMap({ hike }: { hike: Hike }) {
  if (!hike.location) return null;
  const { lat, lng } = hike.location;
  const d = 0.08;
  const bbox = [lng - d * 1.6, lat - d, lng + d * 1.6, lat + d].map((n) => n.toFixed(4)).join(",");
  return (
    <div className={styles.map}>
      <iframe
        title={`Map of ${hike.title}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
        loading="lazy"
        className={styles.mapFrame}
      />
      <p className={styles.mapLinks}>
        <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener noreferrer">
          Open in Google Maps
        </a>
        <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`} target="_blank" rel="noopener noreferrer">
          OpenStreetMap
        </a>
      </p>
    </div>
  );
}

export function WeatherStrip({ days }: { days: DayForecast[] }) {
  if (days.length === 0) return <p className={styles.muted}>Forecast unavailable right now.</p>;
  return (
    <>
      <ul className={styles.weather}>
        {days.map((day) => {
          const date = new Date(`${day.date}T12:00:00Z`);
          return (
            <li key={day.date} className={styles.day}>
              <span className={styles.dayName}>
                {date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
              </span>
              <span className={styles.temps}>
                {day.max}° <span className={styles.alt}>/ {day.min}°C</span>
              </span>
              <span className={styles.sky}>{weatherLabel(day.symbol)}</span>
            </li>
          );
        })}
      </ul>
      <p className={styles.attribution}>Forecast for the trail area from MET Norway, updated hourly.</p>
    </>
  );
}

/** @great_hikes posts that featured this place — always credited and linked to the post. */
export function InstagramFeatures({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <ul className={styles.features}>
      {posts.map((post) => (
        <li key={post.id}>
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" className={styles.feature}>
            <Image
              src={post.image.medium || post.image.large}
              alt={post.title ? `${post.title} — photo by @${post.handle}` : `Photo by @${post.handle}`}
              width={480}
              height={600}
              sizes="(min-width: 992px) 20vw, 50vw"
              className={styles.featureImage}
            />
            <span className={styles.featureCredit}>Photo: @{post.handle} · View on Instagram</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
