import type { TrailGeo } from "@/lib/schema";
import styles from "./Trail.module.css";

const W = 420;
const H = 170;
const PAD = { l: 40, r: 10, t: 8, b: 22 };

/** Elevation along the trail as an inline SVG (no chart library), with a text summary. */
export default function ElevationProfile({ geo, oneWay }: { geo: TrailGeo; oneWay: boolean }) {
  const pts = geo.profile;
  const maxKm = pts.at(-1)![0] || 1;
  const lo = Math.floor(geo.minM / 100) * 100;
  const hi = Math.ceil(geo.maxM / 100) * 100 || lo + 100;
  const x = (km: number) => PAD.l + (km / maxKm) * (W - PAD.l - PAD.r);
  const y = (m: number) => PAD.t + (1 - (m - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
  const path = pts.map(([km, m], i) => `${i ? "L" : "M"}${x(km).toFixed(1)},${y(m).toFixed(1)}`).join("");
  const area = `${path}L${x(maxKm).toFixed(1)},${H - PAD.b}L${PAD.l},${H - PAD.b}Z`;
  const ticks = [lo, Math.round((lo + hi) / 200) * 100, hi];
  const kmTicks = [0, maxKm / 2, maxKm];

  return (
    <figure className={styles.profile}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="profile-desc" className={styles.profileSvg}>
        <desc id="profile-desc">
          Elevation from {pts[0][1]} m to {pts.at(-1)![1]} m over {geo.lengthKm} km; lowest {geo.minM} m, highest{" "}
          {geo.maxM} m.
        </desc>
        {ticks.map((m) => (
          <g key={m}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(m)} y2={y(m)} className={styles.grid} />
            <text x={PAD.l - 6} y={y(m) + 4} textAnchor="end" className={styles.axis}>
              {m.toLocaleString("en-US")}
            </text>
          </g>
        ))}
        {kmTicks.map((km) => (
          <text key={km} x={x(km)} y={H - 6} textAnchor="middle" className={styles.axis}>
            {km < 10 ? km.toFixed(1) : Math.round(km)} km
          </text>
        ))}
        <path d={area} className={styles.area} />
        <path d={path} className={styles.line} />
      </svg>
      <figcaption className={styles.caption}>
        Measured on the map{oneWay ? ", one way" : ""}: {geo.lengthKm} km, about +{geo.gainM.toLocaleString("en-US")} m
        of climbing, {geo.minM.toLocaleString("en-US")}–{geo.maxM.toLocaleString("en-US")} m. {geo.attribution}.
      </figcaption>
    </figure>
  );
}
