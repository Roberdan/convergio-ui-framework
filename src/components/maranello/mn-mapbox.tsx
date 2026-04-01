"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapboxMarker {
  id: string | number
  lat: number
  lon: number
  label: string
  detail?: string
  stage?: string
  color?: string
  count?: number
}

export interface MapboxStage {
  id: string
  label: string
  color: string
}

export interface MnMapboxProps extends React.HTMLAttributes<HTMLDivElement> {
  accessToken: string
  center?: [number, number]
  zoom?: number
  projection?: "globe" | "mercator"
  mapStyle?: string
  markers?: MapboxMarker[]
  stages?: MapboxStage[]
  showLegend?: boolean
  onMarkerClick?: (marker: MapboxMarker) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DARK_STYLE = "mapbox://styles/mapbox/dark-v11"

const DEFAULT_STAGES: MapboxStage[] = [
  { id: "prospect", label: "Prospect", color: "#4EA8DE" },
  { id: "exploration", label: "Exploration", color: "#FFC72C" },
  { id: "sprint", label: "Sprint", color: "#00A651" },
  { id: "wrap-up", label: "Wrap-up", color: "#D4622B" },
  { id: "completed", label: "Completed", color: "#8B5CF6" },
  { id: "on-hold", label: "On Hold", color: "#DC0000" },
]

// ---------------------------------------------------------------------------
// Dynamic import guard
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type MapboxGL = any

function loadMapboxGL(): Promise<MapboxGL | null> {
  if (typeof window === "undefined") return Promise.resolve(null)
  // mapbox-gl is an optional peer dependency — dynamic import with catch
  return import(/* webpackIgnore: true */ "mapbox-gl" as string)
    .then((mod: Record<string, unknown>) => mod.default ?? mod)
    .catch(() => null)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function resolveMarkerColor(
  m: MapboxMarker,
  stageColors: Record<string, string>,
): string {
  if (m.color) return m.color
  if (m.stage && stageColors[m.stage]) return stageColors[m.stage]
  return "#FFC72C"
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `MnMapbox` wraps Mapbox GL JS with marker support, popups,
 * a configurable initial viewport, and a graceful fallback
 * when mapbox-gl is not installed.
 */
export function MnMapbox({
  accessToken,
  center = [12.0, 42.5],
  zoom = 3,
  projection = "globe",
  mapStyle = DARK_STYLE,
  markers = [],
  stages,
  showLegend = true,
  onMarkerClick,
  className,
  ...props
}: MnMapboxProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<any>(null)
  const markerInstancesRef = React.useRef<any[]>([])
  const [ready, setReady] = React.useState(false)
  const [error, setError] = React.useState(false)

  const resolvedStages = stages ?? DEFAULT_STAGES
  const stageColors = React.useMemo(() => {
    const m: Record<string, string> = {}
    for (const s of resolvedStages) m[s.id] = s.color
    return m
  }, [resolvedStages])

  // Init map
  React.useEffect(() => {
    let cancelled = false

    loadMapboxGL().then((mb) => {
      if (cancelled || !containerRef.current || !mb) {
        if (!cancelled && !mb) setError(true)
        return
      }

      mb.accessToken = accessToken

      const map = new mb.Map({
        container: containerRef.current,
        style: mapStyle,
        center,
        zoom,
        projection,
        attributionControl: false,
      })

      map.addControl(new mb.NavigationControl({ showCompass: true }), "top-right")
      map.addControl(new mb.AttributionControl({ compact: true }))

      mapRef.current = { map, mb }
      map.on("load", () => {
        if (!cancelled) setReady(true)
      })
    })

    return () => {
      cancelled = true
      markerInstancesRef.current.forEach((m) => m.remove())
      markerInstancesRef.current = []
      mapRef.current?.map?.remove()
      mapRef.current = null
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, mapStyle, projection])

  // Render markers when ready or markers change
  React.useEffect(() => {
    if (!ready || !mapRef.current) return
    const { map, mb } = mapRef.current

    markerInstancesRef.current.forEach((m) => m.remove())
    markerInstancesRef.current = []

    for (const m of markers) {
      const color = resolveMarkerColor(m, stageColors)

      const el = document.createElement("div")
      el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px ${color}80;cursor:pointer;transition:transform 0.15s`

      if (m.count && m.count > 1) {
        el.style.width = "28px"
        el.style.height = "28px"
        el.style.display = "flex"
        el.style.alignItems = "center"
        el.style.justifyContent = "center"
        el.style.fontSize = "0.6rem"
        el.style.fontWeight = "700"
        el.style.color = "#000"
        el.textContent = String(m.count)
      }

      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.4)" })
      el.addEventListener("mouseleave", () => { el.style.transform = "" })

      const popup = new mb.Popup({
        offset: 20,
        closeButton: false,
        className: "mn-mapbox-popup",
      }).setHTML(
        `<div style="font-weight:600;margin-bottom:2px">${escapeHtml(m.label)}</div>` +
        (m.detail ? `<div style="font-size:0.75rem;opacity:0.7">${escapeHtml(m.detail)}</div>` : ""),
      )

      const inst = new mb.Marker({ element: el })
        .setLngLat([m.lon, m.lat])
        .setPopup(popup)
        .addTo(map)

      if (onMarkerClick) {
        el.addEventListener("click", () => onMarkerClick(m))
      }

      markerInstancesRef.current.push(inst)
    }
  }, [ready, markers, stageColors, onMarkerClick])

  // Fallback when mapbox-gl is unavailable
  if (error) {
    return (
      <div
        {...props}
        className={cn(
          "flex min-h-[300px] items-center justify-center rounded border border-[var(--mn-border,#333)] bg-[var(--mn-surface,#111)] text-sm text-[var(--mn-text-muted,#666)]",
          className,
        )}
      >
        <p className="max-w-xs text-center">
          <strong>mapbox-gl</strong> is not installed.
          <br />
          Run <code className="rounded bg-[var(--mn-surface-raised,#222)] px-1">pnpm add mapbox-gl</code> and add your access token.
        </p>
      </div>
    )
  }

  return (
    <div
      {...props}
      className={cn("relative block min-h-[300px]", className)}
    >
      <div ref={containerRef} className="h-full min-h-[inherit] w-full" />

      {showLegend && ready && (
        <div className="absolute bottom-2 left-2 z-10 flex gap-2.5 rounded-md bg-black/70 px-2.5 py-1.5 text-[0.65rem]">
          {resolvedStages.map((s) => (
            <span key={s.id} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-[var(--mn-text-muted,#999)]">{s.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
