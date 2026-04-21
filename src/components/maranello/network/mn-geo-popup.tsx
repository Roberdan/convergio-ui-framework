"use client";

import MapLibreGL, { type PopupOptions } from "maplibre-gl";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

import { useGeoMap, useGeoMarkerContext } from "./mn-geo-map.helpers";
import {
  PopupCloseButton,
  POPUP_SURFACE_CLASS,
  popupSurfaceStyle,
} from "./mn-geo-popup.helpers";

export interface MnGeoMarkerPopupProps
  extends Omit<PopupOptions, "className" | "closeButton"> {
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
}

export function MnGeoMarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MnGeoMarkerPopupProps) {
  const t = useLocale("geoMap");
  const { marker, map } = useGeoMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const prev = useRef(popupOptions);

  const popup = useMemo(() => {
    return new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth("none")
      .setDOMContent(container);
    // Popup instance is created once per mount; callers observe subsequent
    // prop changes via the imperative `setOffset` / `setMaxWidth` / `setLngLat`
    // calls below when the popup is open. Empty deps is deliberate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => {
      marker.setPopup(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (popup.isOpen()) {
    if (prev.current.offset !== popupOptions.offset) {
      popup.setOffset(popupOptions.offset ?? 16);
    }
    if (
      prev.current.maxWidth !== popupOptions.maxWidth &&
      popupOptions.maxWidth
    ) {
      popup.setMaxWidth(popupOptions.maxWidth ?? "none");
    }
    prev.current = popupOptions;
  }

  return createPortal(
    <div
      className={cn(POPUP_SURFACE_CLASS, className)}
      style={popupSurfaceStyle()}
      role="dialog"
    >
      {closeButton && (
        <PopupCloseButton onClick={() => popup.remove()} label={t.closePopup} />
      )}
      {children}
    </div>,
    container,
  );
}

export interface MnGeoMarkerTooltipProps
  extends Omit<PopupOptions, "className" | "closeButton" | "closeOnClick"> {
  children: ReactNode;
  className?: string;
}

export function MnGeoMarkerTooltip({
  children,
  className,
  ...popupOptions
}: MnGeoMarkerTooltipProps) {
  const { marker, map } = useGeoMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);

  const tooltip = useMemo(() => {
    return new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeOnClick: true,
      closeButton: false,
    }).setMaxWidth("none");
    // Popup instance is created once per mount; callers observe subsequent
    // prop changes via the imperative `setOffset` / `setMaxWidth` / `setLngLat`
    // calls below when the popup is open. Empty deps is deliberate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    tooltip.setDOMContent(container);

    const onEnter = () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map);
    };
    const onLeave = () => tooltip.remove();

    const el = marker.getElement();
    el?.addEventListener("mouseenter", onEnter);
    el?.addEventListener("mouseleave", onLeave);

    return () => {
      el?.removeEventListener("mouseenter", onEnter);
      el?.removeEventListener("mouseleave", onLeave);
      tooltip.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return createPortal(
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none rounded-md px-2 py-1 text-xs text-balance",
        className,
      )}
      style={{
        background: "var(--mn-text)",
        color: "var(--mn-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </div>,
    container,
  );
}

export interface MnGeoPopupProps
  extends Omit<PopupOptions, "className" | "closeButton"> {
  longitude: number;
  latitude: number;
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
  onClose?: () => void;
}

export function MnGeoPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MnGeoPopupProps) {
  const t = useLocale("geoMap");
  const { map } = useGeoMap();
  const prev = useRef(popupOptions);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const container = useMemo(() => document.createElement("div"), []);

  const popup = useMemo(() => {
    return new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth("none")
      .setLngLat([longitude, latitude]);
    // Popup instance is created once per mount; callers observe subsequent
    // prop changes via the imperative `setOffset` / `setMaxWidth` / `setLngLat`
    // calls below when the popup is open. Empty deps is deliberate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    const handleClose = () => onCloseRef.current?.();
    popup.on("close", handleClose);
    popup.setDOMContent(container);
    popup.addTo(map);
    return () => {
      popup.off("close", handleClose);
      if (popup.isOpen()) popup.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (popup.isOpen()) {
    if (
      popup.getLngLat().lng !== longitude ||
      popup.getLngLat().lat !== latitude
    ) {
      popup.setLngLat([longitude, latitude]);
    }
    if (prev.current.offset !== popupOptions.offset) {
      popup.setOffset(popupOptions.offset ?? 16);
    }
    if (
      prev.current.maxWidth !== popupOptions.maxWidth &&
      popupOptions.maxWidth
    ) {
      popup.setMaxWidth(popupOptions.maxWidth ?? "none");
    }
    prev.current = popupOptions;
  }

  return createPortal(
    <div
      role="dialog"
      className={cn(POPUP_SURFACE_CLASS, className)}
      style={popupSurfaceStyle()}
    >
      {closeButton && (
        <PopupCloseButton
          onClick={() => popup.remove()}
          label={t.closePopup}
        />
      )}
      {children}
    </div>,
    container,
  );
}
