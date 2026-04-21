/**
 * MnGeoMap — MapLibre-powered tile map container.
 *
 * Ported and adapted from mapcn (MIT, © 2025 Anmoldeep Singh, https://mapcn.dev)
 * with MapLibre GL JS (BSD-3-Clause). See THIRD_PARTY_LICENSES.md.
 *
 * The consumer MUST supply a tile style via `styles` or `lightStyleUrl` /
 * `darkStyleUrl`. This framework never ships tile data or API keys — the
 * consumer is responsible for respecting their chosen tile provider's TOS and
 * attribution requirements.
 */
"use client";

import MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

import {
  GeoMapContext,
  getViewport,
  useResolvedGeoTheme,
  type GeoMapRef,
  type GeoMapStyleOption,
  type GeoMapTheme,
  type GeoMapViewport,
} from "./mn-geo-map.helpers";

export interface MnGeoMapProps
  extends Omit<MapLibreGL.MapOptions, "container" | "style"> {
  children?: ReactNode;
  className?: string;
  /** Force a theme ("light" | "dark"). Omit to auto-detect from `data-theme`. */
  theme?: GeoMapTheme;
  /** Style URL or StyleSpecification per theme. */
  styles?: { light?: GeoMapStyleOption; dark?: GeoMapStyleOption };
  projection?: MapLibreGL.ProjectionSpecification;
  /** Controlled viewport — pair with `onViewportChange`. */
  viewport?: Partial<GeoMapViewport>;
  onViewportChange?: (viewport: GeoMapViewport) => void;
  /** Forces the loading indicator while your data is in flight. */
  loading?: boolean;
}

function Loader({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="absolute inset-0 z-10 flex items-center justify-center"
      style={{
        background:
          "color-mix(in srgb, var(--mn-surface) 55%, transparent)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="flex gap-1">
        <span className="mn-geo-map__dot" />
        <span className="mn-geo-map__dot [animation-delay:150ms]" />
        <span className="mn-geo-map__dot [animation-delay:300ms]" />
      </div>
      <style>{`
        .mn-geo-map__dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: color-mix(in srgb, var(--mn-text-muted) 70%, transparent);
          animation: mn-geo-map-pulse 1s ease-in-out infinite;
        }
        @keyframes mn-geo-map-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export const MnGeoMap = forwardRef<GeoMapRef, MnGeoMapProps>(function MnGeoMap(
  {
    children,
    className,
    theme: themeProp,
    styles,
    projection,
    viewport,
    onViewportChange,
    loading = false,
    ...props
  },
  ref,
) {
  const t = useLocale("geoMap");
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef = useRef<GeoMapStyleOption | null>(null);
  const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalUpdateRef = useRef(false);
  const resolvedTheme = useResolvedGeoTheme(themeProp);

  const isControlled = viewport !== undefined && onViewportChange !== undefined;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const mapStyles = useMemo(
    () => ({ dark: styles?.dark, light: styles?.light }),
    [styles],
  );

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

    if (!initialStyle) {
      // No style provided — render container but skip MapLibre init.
      // Consumer sees a surface with loader/empty; they must supply a style.
      return;
    }

    currentStyleRef.current = initialStyle;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });

    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) map.setProjection(projection);
      }, 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const handleMove = () => {
      if (internalUpdateRef.current) return;
      onViewportChangeRef.current?.(getViewport(map));
    };

    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", handleMove);
    setMapInstance(map);

    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", handleMove);
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return;
    if (mapInstance.isMoving()) return;

    const cur = getViewport(mapInstance);
    const next = {
      center: viewport.center ?? cur.center,
      zoom: viewport.zoom ?? cur.zoom,
      bearing: viewport.bearing ?? cur.bearing,
      pitch: viewport.pitch ?? cur.pitch,
    };

    if (
      next.center[0] === cur.center[0] &&
      next.center[1] === cur.center[1] &&
      next.zoom === cur.zoom &&
      next.bearing === cur.bearing &&
      next.pitch === cur.pitch
    ) {
      return;
    }

    internalUpdateRef.current = true;
    mapInstance.jumpTo(next);
    internalUpdateRef.current = false;
  }, [mapInstance, isControlled, viewport]);

  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (!newStyle || currentStyleRef.current === newStyle) return;

    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, isLoaded, isStyleLoaded],
  );

  return (
    <GeoMapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        role="region"
        aria-label={t.interactiveMap}
        className={cn("relative h-full w-full overflow-hidden rounded-md", className)}
        style={{
          background: "var(--mn-surface-sunken)",
          border: "1px solid var(--mn-border)",
        }}
      >
        {(!isLoaded || loading) && <Loader label={t.loading} />}
        {mapInstance && children}
      </div>
    </GeoMapContext.Provider>
  );
});

export type { GeoMapRef, GeoMapViewport, GeoMapTheme, GeoMapStyleOption };
