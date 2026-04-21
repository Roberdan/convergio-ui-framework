/**
 * Shared helpers for MnGeoMap — context, theme hook, types.
 *
 * Ported from mapcn (MIT, © 2025 Anmoldeep Singh, https://mapcn.dev).
 * See THIRD_PARTY_LICENSES.md for full attribution.
 */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type MapLibreGL from "maplibre-gl";

export type GeoMapTheme = "light" | "dark";

export type GeoMapStyleOption = string | MapLibreGL.StyleSpecification;

export interface GeoMapViewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export type GeoMapRef = MapLibreGL.Map;

export interface GeoMapContextValue {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
}

export const GeoMapContext = createContext<GeoMapContextValue | null>(null);

export function useGeoMap(): GeoMapContextValue {
  const ctx = useContext(GeoMapContext);
  if (!ctx) {
    throw new Error("useGeoMap must be used within an MnGeoMap component");
  }
  return ctx;
}

export interface GeoMarkerContextValue {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
}

export const GeoMarkerContext = createContext<GeoMarkerContextValue | null>(
  null,
);

export function useGeoMarkerContext(): GeoMarkerContextValue {
  const ctx = useContext(GeoMarkerContext);
  if (!ctx) {
    throw new Error(
      "Marker subcomponents must be rendered inside <MnGeoMarker>",
    );
  }
  return ctx;
}

/**
 * Theme detection:
 *  1. explicit `themeProp` wins,
 *  2. else resolve from document `data-theme` attribute (Maranello's
 *     theme provider sets `data-theme="navy|dark|light|colorblind"`),
 *  3. else fall back to system `prefers-color-scheme`.
 */
function readDataTheme(): GeoMapTheme | null {
  if (typeof document === "undefined") return null;
  const value = document.documentElement.getAttribute("data-theme");
  if (!value) return null;
  // Treat "light" and "colorblind" as light basemaps; "navy" and "dark" as dark.
  return value === "light" || value === "colorblind" ? "light" : "dark";
}

function systemTheme(): GeoMapTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useResolvedGeoTheme(themeProp?: GeoMapTheme): GeoMapTheme {
  const [detected, setDetected] = useState<GeoMapTheme>(
    () => readDataTheme() ?? systemTheme(),
  );

  useEffect(() => {
    if (themeProp) return;

    const observer = new MutationObserver(() => {
      const next = readDataTheme();
      if (next) setDetected(next);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (!readDataTheme()) setDetected(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, [themeProp]);

  return themeProp ?? detected;
}

export function getViewport(map: MapLibreGL.Map): GeoMapViewport {
  const c = map.getCenter();
  return {
    center: [c.lng, c.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

export type { ReactNode };
