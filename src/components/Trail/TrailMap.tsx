"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import styles from "./Trail.module.css";

type Props = {
  title: string;
  /** [lng, lat] pairs (GeoJSON order). */
  line?: [number, number][];
  /** Fallback marker when there's no line yet. */
  point?: { lat: number; lng: number };
};

/** Interactive OpenStreetMap map with the trail drawn on it. Leaflet loads only on this page. */
export default function TrailMap({ title, line, point }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const dot = (lat: number, lng: number, color: string) =>
        L.circleMarker([lat, lng], { radius: 7, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 }).addTo(map!);
      if (line && line.length > 1) {
        const latlngs = line.map(([lng, lat]) => [lat, lng] as [number, number]);
        const poly = L.polyline(latlngs, { color: "#ff7a1a", weight: 4, opacity: 0.95 }).addTo(map);
        dot(latlngs[0][0], latlngs[0][1], "#1f7a43").bindTooltip("Start");
        dot(latlngs.at(-1)![0], latlngs.at(-1)![1], "#b3261e").bindTooltip("End");
        map.fitBounds(poly.getBounds(), { padding: [24, 24] });
      } else if (point) {
        dot(point.lat, point.lng, "#1f7a43");
        map.setView([point.lat, point.lng], 12);
      }
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [line, point]);

  return <div ref={ref} className={styles.map} role="region" aria-label={`Map of ${title}`} />;
}
