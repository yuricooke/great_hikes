"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MapItem } from "@/lib/map-data";
import { CONTINENTS, LANDSCAPES } from "@/lib/schema";
import Icon from "../Icon";
import styles from "./MapExplorer.module.css";

const STYLE = "https://tiles.openfreemap.org/styles/dark";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LEVELS = ["easy", "moderate", "challenging", "strenuous"] as const;
const COLORS: Record<string, string> = {
  easy: "#5fd38a",
  moderate: "#ffd166",
  challenging: "#ff9a3c",
  strenuous: "#ff5c5c",
};

type Filters = { landscape: string; continent: string; difficulty: string; month: string };
const EMPTY: Filters = { landscape: "", continent: "", difficulty: "", month: "" };

function matches(item: MapItem, f: Filters) {
  if (f.landscape && !item.landscapes.includes(f.landscape as never)) return false;
  if (f.continent && item.continent !== f.continent) return false;
  if (f.difficulty && item.difficulty !== f.difficulty) return false;
  if (f.month && !item.bestMonths.includes(Number(f.month))) return false;
  return true;
}

function readUrl(): { filters: Filters; view?: { lat: number; lng: number; z: number } } {
  if (typeof window === "undefined") return { filters: EMPTY };
  const q = new URLSearchParams(window.location.search);
  const filters = { ...EMPTY };
  for (const k of Object.keys(EMPTY) as (keyof Filters)[]) filters[k] = q.get(k) ?? "";
  const lat = Number(q.get("lat"));
  const lng = Number(q.get("lng"));
  const z = Number(q.get("z"));
  return { filters, view: q.has("lat") && q.has("lng") && q.has("z") ? { lat, lng, z } : undefined };
}

const cap = (s: string | null) => (s ? s[0].toUpperCase() + s.slice(1) : null);
const facts = (i: MapItem) => [i.distanceKm && `${i.distanceKm} km`, i.duration, cap(i.difficulty)].filter(Boolean).join(" · ");

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** /map — places as clustered pins, trails as coloured lines, a list synced to the view. */
export default function MapExplorer({ items }: { items: MapItem[] }) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [ready, setReady] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => readUrl().filters);
  const [inView, setInView] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const filtered = useMemo(() => items.filter((i) => matches(i, filters)), [items, filters]);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const collections = useMemo(() => {
    const point = (i: MapItem) => ({
      type: "Feature" as const,
      properties: { id: i.id, kind: i.kind, difficulty: i.difficulty ?? "" },
      geometry: { type: "Point" as const, coordinates: [i.lng, i.lat] },
    });
    return {
      places: { type: "FeatureCollection" as const, features: filtered.filter((i) => i.kind === "place").map(point) },
      starts: { type: "FeatureCollection" as const, features: filtered.filter((i) => i.kind === "trail").map(point) },
      lines: {
        type: "FeatureCollection" as const,
        features: filtered
          .filter((i) => i.line)
          .map((i) => ({
            type: "Feature" as const,
            properties: { id: i.id, difficulty: i.difficulty ?? "" },
            geometry: { type: "LineString" as const, coordinates: i.line! },
          })),
      },
    };
  }, [filtered]);

  const syncUrl = useCallback(() => {
    // Never touch the URL once the visitor has navigated away (an animation can still be finishing).
    if (window.location.pathname !== "/map") return;
    const map = mapRef.current;
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) q.set(k, v);
    if (map) {
      const c = map.getCenter();
      q.set("lat", c.lat.toFixed(4));
      q.set("lng", c.lng.toFixed(4));
      q.set("z", map.getZoom().toFixed(1));
    }
    window.history.replaceState(null, "", `${window.location.pathname}${q.size ? `?${q}` : ""}`);
  }, [filters]);

  const updateInView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    setInView(filtered.filter((i) => b.contains([i.lng, i.lat])).map((i) => i.id));
  }, [filtered]);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    let map: MlMap | undefined;
    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !box.current) return;
      const { view } = readUrl();
      map = new maplibregl.Map({
        container: box.current,
        style: STYLE,
        center: view ? [view.lng, view.lat] : [10, 22],
        zoom: view ? view.z : 1.4,
        attributionControl: { compact: true },
        cooperativeGestures: window.matchMedia("(max-width: 767px)").matches,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      map.on("load", () => {
        const m = map!;
        m.addSource("places", { type: "geojson", data: { type: "FeatureCollection", features: [] }, cluster: true, clusterRadius: 42, clusterMaxZoom: 6 });
        m.addSource("starts", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        m.addSource("lines", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        m.addSource("selected", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        const byDifficulty = ["match", ["get", "difficulty"], ...Object.entries(COLORS).flat(), "#ffffff"] as unknown as string;
        m.addLayer({ id: "lines", type: "line", source: "lines", minzoom: 8, paint: { "line-color": byDifficulty, "line-width": 3.5, "line-opacity": 0.95 } });
        m.addLayer({ id: "starts", type: "circle", source: "starts", minzoom: 8, paint: { "circle-radius": 6, "circle-color": byDifficulty, "circle-stroke-color": "#000", "circle-stroke-width": 1.5 } });
        m.addLayer({
          id: "clusters",
          type: "circle",
          source: "places",
          filter: ["has", "point_count"],
          paint: { "circle-color": "rgba(31,122,67,0.9)", "circle-radius": ["step", ["get", "point_count"], 16, 5, 20, 15, 26], "circle-stroke-color": "#fff", "circle-stroke-width": 1.5 },
        });
        m.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "places",
          filter: ["has", "point_count"],
          layout: { "text-field": ["get", "point_count_abbreviated"], "text-font": ["Noto Sans Bold"], "text-size": 13 },
          paint: { "text-color": "#fff" },
        });
        m.addLayer({
          id: "places",
          type: "circle",
          source: "places",
          filter: ["!", ["has", "point_count"]],
          paint: { "circle-radius": 8, "circle-color": "#1f7a43", "circle-stroke-color": "#fff", "circle-stroke-width": 2 },
        });
        m.addLayer({ id: "selected", type: "circle", source: "selected", paint: { "circle-radius": 13, "circle-color": "rgba(255,255,255,0.15)", "circle-stroke-color": "#fff", "circle-stroke-width": 3 } });

        for (const layer of ["places", "starts", "lines"]) {
          m.on("click", layer, (e) => {
            const id = e.features?.[0]?.properties?.id as string | undefined;
            if (id) setSelected(id);
          });
          m.on("mouseenter", layer, () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", layer, () => (m.getCanvas().style.cursor = ""));
        }
        m.on("click", "clusters", async (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const zoom = await (m.getSource("places") as GeoJSONSource).getClusterExpansionZoom(f.properties.cluster_id);
          const center = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          if (reduceMotion()) m.jumpTo({ center, zoom });
          else m.easeTo({ center, zoom });
        });
        m.on("mouseenter", "clusters", () => (m.getCanvas().style.cursor = "pointer"));
        m.on("mouseleave", "clusters", () => (m.getCanvas().style.cursor = ""));
        mapRef.current = m;
        setReady(true);
      });
    });
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Push filtered data into the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource("places") as GeoJSONSource).setData(collections.places);
    (map.getSource("starts") as GeoJSONSource).setData(collections.starts);
    (map.getSource("lines") as GeoJSONSource).setData(collections.lines);
    updateInView();
    syncUrl();
  }, [ready, collections, updateInView, syncUrl]);

  // Keep the list and the URL in step with the view.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const onMove = () => {
      updateInView();
      syncUrl();
    };
    map.on("moveend", onMove);
    return () => {
      map.off("moveend", onMove);
    };
  }, [ready, updateInView, syncUrl]);

  // Highlight the selected item.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const item = selected ? byId.get(selected) : undefined;
    (map.getSource("selected") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: item ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [item.lng, item.lat] } }] : [],
    });
  }, [ready, selected, byId]);

  function focus(item: MapItem) {
    setSelected(item.id);
    const map = mapRef.current;
    if (!map) return;
    const opts = { center: [item.lng, item.lat] as [number, number], zoom: Math.max(map.getZoom(), item.kind === "trail" ? 11 : 8) };
    if (reduceMotion()) map.jumpTo(opts);
    else map.flyTo({ ...opts, speed: 1.6 });
  }

  function nearMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const opts = { center: [pos.coords.longitude, pos.coords.latitude] as [number, number], zoom: 6 };
        if (reduceMotion()) mapRef.current?.jumpTo(opts);
        else mapRef.current?.flyTo(opts);
      },
      () => setLocating(false),
      { timeout: 10000 },
    );
  }

  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const visible = (inView ? inView.map((id) => byId.get(id)!).filter(Boolean) : filtered).sort((a, b) =>
    a.kind === b.kind ? a.title.localeCompare(b.title) : a.kind === "place" ? -1 : 1,
  );
  const current = selected ? byId.get(selected) : undefined;
  const active = Object.values(filters).some(Boolean);

  return (
    <div className={styles.explorer}>
      <div ref={box} className={styles.map} role="region" aria-label="Map of hikes and trails" />

      <section className={styles.panel} aria-labelledby="map-title">
        <h1 id="map-title" className={styles.title}>
          Find a hike on the map
        </h1>
        <div className={styles.filters}>
          <label>
            <span>Landscape</span>
            <select value={filters.landscape} onChange={set("landscape")}>
              <option value="">Any</option>
              {LANDSCAPES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Continent</span>
            <select value={filters.continent} onChange={set("continent")}>
              <option value="">Any</option>
              {CONTINENTS.map((c) => (
                <option key={c.key} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Difficulty</span>
            <select value={filters.difficulty} onChange={set("difficulty")}>
              <option value="">Any</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l[0].toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Good in</span>
            <select value={filters.month} onChange={set("month")}>
              <option value="">Any month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.tools}>
          <p className={styles.count} aria-live="polite">
            {visible.length} {visible.length === 1 ? "result" : "results"} in view
          </p>
          {active && (
            <button type="button" className={styles.link} onClick={() => setFilters(EMPTY)}>
              Clear filters
            </button>
          )}
          <button type="button" className={styles.link} onClick={nearMe} disabled={locating}>
            <Icon name="map" size={18} /> {locating ? "Locating…" : "Near me"}
          </button>
        </div>

        <ul className={styles.legend} aria-label="Trail colours by difficulty">
          {LEVELS.map((l) => (
            <li key={l}>
              <span className={styles.swatch} style={{ background: COLORS[l] }} aria-hidden="true" />
              {cap(l)}
            </li>
          ))}
        </ul>

        <ul className={styles.list} aria-label="Hikes in view">
          {visible.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={styles.item}
                aria-pressed={item.id === selected}
                onClick={() => focus(item)}
                onMouseEnter={() => setSelected(item.id)}
              >
                <Image src={item.image} alt="" width={96} height={72} className={styles.thumb} sizes="96px" />
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemMeta}>
                    {item.kind === "trail" ? `Trail · ${item.subtitle}` : item.subtitle}
                  </span>
                  <span className={styles.itemMeta}>
                    {facts(item)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {visible.length === 0 && <p className={styles.empty}>Nothing here — zoom out or clear the filters.</p>}
      </section>

      {current && (
        <aside className={styles.preview} aria-label={`Selected: ${current.title}`}>
          <Image src={current.image} alt="" width={320} height={200} className={styles.previewImage} sizes="320px" />
          <div className={styles.previewBody}>
            <p className={styles.itemMeta}>{current.kind === "trail" ? `Trail · ${current.subtitle}` : current.subtitle}</p>
            <h2 className={styles.previewTitle}>{current.title}</h2>
            <p className={styles.itemMeta}>
              {facts(current)}
            </p>
            <div className={styles.previewActions}>
              <Link href={current.href} className={styles.open} onClick={() => mapRef.current?.stop()}>
                Open {current.kind === "trail" ? "trail" : "hike"}
              </Link>
              <button type="button" className={styles.link} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
