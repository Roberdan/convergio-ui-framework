/**
 * MnGeoMarker + MarkerContent + MarkerLabel — marker primitives for MnGeoMap.
 *
 * Ported from mapcn (MIT, © 2025 Anmoldeep Singh). See THIRD_PARTY_LICENSES.md.
 */
"use client";

import MapLibreGL, { type MarkerOptions } from "maplibre-gl";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import {
  GeoMarkerContext,
  useGeoMap,
  useGeoMarkerContext,
} from "./mn-geo-map.helpers";

export interface MnGeoMarkerProps extends Omit<MarkerOptions, "element"> {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
}

export function MnGeoMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MnGeoMarkerProps) {
  const { map } = useGeoMap();

  const cbRef = useRef({
    onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd,
  });
  cbRef.current = {
    onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd,
  };

  const marker = useMemo(() => {
    const inst = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement("div"),
      draggable,
    }).setLngLat([longitude, latitude]);

    const el = inst.getElement();
    const handleClick = (e: MouseEvent) => cbRef.current.onClick?.(e);
    const handleEnter = (e: MouseEvent) => cbRef.current.onMouseEnter?.(e);
    const handleLeave = (e: MouseEvent) => cbRef.current.onMouseLeave?.(e);

    el?.addEventListener("click", handleClick);
    el?.addEventListener("mouseenter", handleEnter);
    el?.addEventListener("mouseleave", handleLeave);

    inst.on("dragstart", () => {
      const ll = inst.getLngLat();
      cbRef.current.onDragStart?.({ lng: ll.lng, lat: ll.lat });
    });
    inst.on("drag", () => {
      const ll = inst.getLngLat();
      cbRef.current.onDrag?.({ lng: ll.lng, lat: ll.lat });
    });
    inst.on("dragend", () => {
      const ll = inst.getLngLat();
      cbRef.current.onDragEnd?.({ lng: ll.lng, lat: ll.lat });
    });

    return inst;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (
    marker.getLngLat().lng !== longitude ||
    marker.getLngLat().lat !== latitude
  ) {
    marker.setLngLat([longitude, latitude]);
  }
  if (marker.isDraggable() !== draggable) {
    marker.setDraggable(draggable);
  }

  const curOffset = marker.getOffset();
  const newOffset = markerOptions.offset ?? [0, 0];
  const [nx, ny] = Array.isArray(newOffset)
    ? newOffset
    : [newOffset.x, newOffset.y];
  if (curOffset.x !== nx || curOffset.y !== ny) {
    marker.setOffset(newOffset);
  }
  if (marker.getRotation() !== markerOptions.rotation) {
    marker.setRotation(markerOptions.rotation ?? 0);
  }
  if (marker.getRotationAlignment() !== markerOptions.rotationAlignment) {
    marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
  }
  if (marker.getPitchAlignment() !== markerOptions.pitchAlignment) {
    marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");
  }

  return (
    <GeoMarkerContext.Provider value={{ marker, map }}>
      {children}
    </GeoMarkerContext.Provider>
  );
}

export interface MnGeoMarkerContentProps {
  children?: ReactNode;
  className?: string;
  /** Accessible label for screen readers. Defaults to "Map marker". */
  ariaLabel?: string;
}

/**
 * Renders custom DOM into the marker element. Defaults to a focusable dot.
 */
export function MnGeoMarkerContent({
  children,
  className,
  ariaLabel = "Map marker",
}: MnGeoMarkerContentProps) {
  const { marker } = useGeoMarkerContext();
  return createPortal(
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={cn(
        "relative cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full",
        className,
      )}
      style={{
        // @ts-expect-error CSS custom property
        "--tw-ring-color": "var(--mn-focus-ring)",
      }}
    >
      {children ?? <DefaultGeoMarkerIcon />}
    </div>,
    marker.getElement(),
  );
}

function DefaultGeoMarkerIcon() {
  return (
    <div
      className="relative h-4 w-4 rounded-full border-2"
      style={{
        background: "var(--mn-accent)",
        borderColor: "var(--mn-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    />
  );
}

export interface MnGeoMarkerLabelProps {
  children: ReactNode;
  className?: string;
  position?: "top" | "bottom";
}

export function MnGeoMarkerLabel({
  children,
  className,
  position = "top",
}: MnGeoMarkerLabelProps) {
  const positionClass =
    position === "top" ? "bottom-full mb-1" : "top-full mt-1";
  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "text-[10px] font-medium pointer-events-none",
        positionClass,
        className,
      )}
      style={{ color: "var(--mn-text)" }}
    >
      {children}
    </div>
  );
}
