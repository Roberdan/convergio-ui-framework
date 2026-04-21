"use client";

import { Loader2, Locate, Maximize, Minus, Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

import { useGeoMap } from "./mn-geo-map.helpers";
import {
  CompassButton,
  ControlButton,
  ControlGroup,
} from "./mn-geo-controls.helpers";

export interface MnGeoControlsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

const POSITION_CLASS: Record<NonNullable<MnGeoControlsProps["position"]>, string> = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
};

export function MnGeoControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MnGeoControlsProps) {
  const t = useLocale("geoMap");
  const { map } = useGeoMap();
  const [waiting, setWaiting] = useState(false);

  const zoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);
  const zoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);
  const resetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setWaiting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        map?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          duration: 1500,
        });
        onLocate?.(coords);
        setWaiting(false);
      },
      (err) => {
        console.error("MnGeoControls locate error:", err);
        setWaiting(false);
      },
    );
  }, [map, onLocate]);

  const fullscreen = useCallback(() => {
    const el = map?.getContainer();
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, [map]);

  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-1.5",
        POSITION_CLASS[position],
        className,
      )}
    >
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={zoomIn} label={t.zoomIn}>
            <Plus className="size-4" aria-hidden />
          </ControlButton>
          <ControlButton onClick={zoomOut} label={t.zoomOut} isLast>
            <Minus className="size-4" aria-hidden />
          </ControlButton>
        </ControlGroup>
      )}
      {showCompass && (
        <ControlGroup>
          <CompassButton onClick={resetBearing} label={t.resetBearing} />
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton
            onClick={locate}
            label={t.findLocation}
            disabled={waiting}
            isLast
          >
            {waiting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Locate className="size-4" aria-hidden />
            )}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton
            onClick={fullscreen}
            label={t.toggleFullscreen}
            isLast
          >
            <Maximize className="size-4" aria-hidden />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  );
}
