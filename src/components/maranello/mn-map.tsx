"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type MapMarkerColor = "active" | "warning" | "danger"

export interface MapMarker {
  id: string | number; lat: number; lon: number; label: string
  detail?: string; color?: MapMarkerColor; size?: "sm" | "md" | "lg"; count?: number
}

export interface MnMapProps extends React.HTMLAttributes<HTMLDivElement> {
  markers?: MapMarker[]; zoom?: number; center?: [number, number]
  enableZoom?: boolean; enablePan?: boolean
  onMarkerClick?: (marker: MapMarker) => void
}

const TAU = Math.PI * 2
const SIZE_PX: Record<string, number> = { sm: 6, md: 10, lg: 14 }
const COLORS: Record<MapMarkerColor, string> = { active: "#00A651", warning: "#FFC72C", danger: "#DC0000" }

/* Simplified continent outlines for canvas rendering */
const LAND: [number, number][][] = [
  [[-130,55],[-125,60],[-115,62],[-100,63],[-95,68],[-88,65],[-80,62],[-65,60],[-60,50],[-65,45],[-70,42],[-75,35],[-80,30],[-85,28],[-90,28],[-97,25],[-100,20],[-105,20],[-110,23],[-115,30],[-120,34],[-125,40],[-125,48],[-130,55]],
  [[-80,10],[-75,5],[-70,8],[-60,5],[-50,0],[-45,-3],[-35,-5],[-35,-12],[-38,-18],[-42,-22],[-48,-26],[-50,-30],[-55,-34],[-58,-38],[-65,-42],[-68,-50],[-72,-48],[-75,-42],[-72,-35],[-70,-28],[-70,-18],[-75,-12],[-78,-2],[-80,2],[-80,10]],
  [[-10,36],[-8,42],[-5,44],[0,44],[3,48],[5,52],[8,55],[12,56],[15,58],[20,60],[25,62],[28,65],[30,62],[32,58],[35,55],[40,52],[38,48],[35,45],[30,42],[28,38],[25,36],[20,36],[15,38],[10,38],[5,40],[0,40],[-5,38],[-10,36]],
  [[-15,15],[-17,20],[-15,28],[-5,35],[5,36],[10,37],[15,33],[25,32],[30,30],[32,28],[35,25],[40,15],[42,12],[50,10],[48,5],[42,0],[38,-5],[35,-10],[32,-15],[35,-25],[30,-32],[25,-34],[20,-34],[18,-30],[15,-25],[12,-18],[12,-10],[10,-2],[8,4],[5,5],[0,5],[-5,5],[-10,8],[-15,10],[-15,15]],
  [[40,52],[45,55],[55,55],[60,58],[70,62],[80,65],[100,68],[120,65],[130,60],[135,55],[140,50],[142,45],[140,40],[135,35],[130,32],[122,28],[115,25],[110,20],[105,15],[100,12],[98,8],[100,5],[105,0],[95,5],[88,22],[82,18],[75,15],[72,20],[68,24],[62,25],[55,25],[50,28],[45,32],[42,38],[40,42],[38,48],[40,52]],
  [[115,-12],[120,-15],[130,-12],[135,-15],[140,-18],[145,-20],[148,-22],[150,-25],[152,-28],[150,-32],[148,-35],[142,-38],[138,-35],[135,-32],[130,-30],[125,-28],[120,-25],[118,-22],[115,-18],[115,-12]],
]

interface Projected { _x: number; _y: number }
type RenderedMarker = MapMarker & Projected

function proj(lat: number, lon: number, w: number, h: number, pad: number, z: number, px: number, py: number) {
  const bw = Math.max(1, w - pad * 2) * z, bh = Math.max(1, h - pad * 2) * z
  const cx = (w / 2) * z, cy = (h / 2) * z
  return { x: ((lon + 180) / 360) * bw - cx + w * 0.5 + px, y: ((90 - lat) / 180) * bh - cy + h * 0.5 + py }
}

function mRadius(m: RenderedMarker): number {
  const base = SIZE_PX[m.size || "md"] || SIZE_PX.md
  const c = Math.max(1, m.count || 1)
  return c > 1 ? Math.min(26, Math.max(8, base + Math.sqrt(c) * 1.6)) : base
}

function rgba(hex: string, a: number) {
  return `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`
}

function hitTest(mx: number, my: number, ms: RenderedMarker[]): RenderedMarker | null {
  for (let i = ms.length - 1; i >= 0; i--) {
    const m = ms[i], r = mRadius(m), dx = mx - m._x, dy = my - m._y
    if (dx * dx + dy * dy <= (r + 4) ** 2) return m
  }
  return null
}

/**
 * `MnMap` — canvas-based world map with markers, tooltips, zoom/pan.
 */
export function MnMap({
  markers = [], zoom: initialZoom = 1, center, enableZoom = true,
  enablePan = true, onMarkerClick, className, ...props
}: MnMapProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const tipRef = React.useRef<HTMLDivElement>(null)
  const st = React.useRef({ zoom: initialZoom, panX: 0, panY: 0, rendered: [] as RenderedMarker[], dragging: false, dragX: 0, dragY: 0 })

  const render = React.useCallback(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current
    if (!canvas || !wrap) return
    const { width: vw, height: vh } = wrap.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = vw * dpr; canvas.height = vh * dpr
    canvas.style.width = vw + "px"; canvas.style.height = vh + "px"
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    const s = st.current, pad = 40

    ctx.fillStyle = "#0d0d0d"; ctx.fillRect(0, 0, vw, vh)
    ctx.fillStyle = "#333330"; ctx.strokeStyle = "#444440"; ctx.lineWidth = 0.8
    for (const cont of LAND) {
      ctx.beginPath()
      for (let i = 0; i < cont.length; i++) {
        const p = proj(cont[i][1], cont[i][0], vw, vh, pad, s.zoom, s.panX, s.panY)
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      }
      ctx.closePath(); ctx.fill(); ctx.stroke()
    }

    const rendered: RenderedMarker[] = []
    for (const m of markers) {
      const p = proj(m.lat, m.lon, vw, vh, pad, s.zoom, s.panX, s.panY)
      if (p.x < -60 || p.x > vw + 60 || p.y < -60 || p.y > vh + 60) continue
      const rm: RenderedMarker = { ...m, _x: p.x, _y: p.y }
      rendered.push(rm)
      const r = mRadius(rm), col = COLORS[m.color || "active"]
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.3, 0, TAU); ctx.fillStyle = rgba(col, 0.15); ctx.fill()
      const cr = (m.count && m.count > 1) ? r : r * 0.5
      ctx.beginPath(); ctx.arc(p.x, p.y, cr, 0, TAU); ctx.fillStyle = col; ctx.fill()
      if (m.count && m.count > 1) {
        ctx.fillStyle = "#fff"; ctx.font = `600 ${Math.max(11, Math.round(cr * 0.85))}px sans-serif`
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(m.count), p.x, p.y + 0.5)
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, cr * 0.4, 0, TAU); ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fill()
      }
    }
    s.rendered = rendered
  }, [markers])

  const showTip = React.useCallback((m: RenderedMarker, rect: DOMRect) => {
    const tip = tipRef.current
    if (!tip) return
    tip.textContent = ""
    const lbl = document.createElement("div"); lbl.style.fontWeight = "600"; lbl.textContent = m.label || "Marker"; tip.appendChild(lbl)
    if (m.detail) { const d = document.createElement("div"); d.style.cssText = "font-size:0.65rem;opacity:0.7"; d.textContent = m.detail; tip.appendChild(d) }
    tip.style.opacity = "1"
    const tw = tip.offsetWidth || 120
    let left = m._x - tw / 2; if (left < 4) left = 4; if (left + tw > rect.width - 4) left = rect.width - tw - 4
    let top = m._y - (tip.offsetHeight || 32) - 12; if (top < 4) top = m._y + 12
    tip.style.left = left + "px"; tip.style.top = top + "px"
  }, [])

  const hideTip = React.useCallback(() => { if (tipRef.current) tipRef.current.style.opacity = "0" }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current
    if (!canvas || !wrap) return
    render()
    const ro = new ResizeObserver(() => render()); ro.observe(wrap)

    const onMove = (e: MouseEvent) => {
      const s = st.current
      if (s.dragging) { s.panX += e.clientX - s.dragX; s.panY += e.clientY - s.dragY; s.dragX = e.clientX; s.dragY = e.clientY; render(); return }
      const cr = canvas.getBoundingClientRect(), hit = hitTest(e.clientX - cr.left, e.clientY - cr.top, s.rendered)
      if (hit) { canvas.style.cursor = "pointer"; showTip(hit, cr) }
      else { canvas.style.cursor = enablePan ? "grab" : "default"; hideTip() }
    }
    const onDown = (e: MouseEvent) => { if (!enablePan || e.button !== 0) return; const s = st.current; s.dragging = true; s.dragX = e.clientX; s.dragY = e.clientY; canvas.style.cursor = "grabbing" }
    const onUp = () => { st.current.dragging = false; canvas.style.cursor = enablePan ? "grab" : "default" }
    const onClick = (e: MouseEvent) => { if (!onMarkerClick) return; const cr = canvas.getBoundingClientRect(); const hit = hitTest(e.clientX - cr.left, e.clientY - cr.top, st.current.rendered); if (hit) onMarkerClick(hit) }
    const onWheel = (e: WheelEvent) => { if (!enableZoom || !(e.ctrlKey || e.metaKey)) return; e.preventDefault(); const s = st.current; s.zoom = Math.max(0.5, Math.min(s.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 10)); render() }
    const onLeave = () => hideTip()

    canvas.addEventListener("mousemove", onMove); canvas.addEventListener("mousedown", onDown)
    canvas.addEventListener("click", onClick); canvas.addEventListener("mouseleave", onLeave)
    canvas.addEventListener("wheel", onWheel, { passive: false }); window.addEventListener("mouseup", onUp)
    return () => { ro.disconnect(); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mousedown", onDown); canvas.removeEventListener("click", onClick); canvas.removeEventListener("mouseleave", onLeave); canvas.removeEventListener("wheel", onWheel); window.removeEventListener("mouseup", onUp) }
  }, [render, enablePan, enableZoom, onMarkerClick, showTip, hideTip])

  React.useEffect(() => {
    if (!center) return; const wrap = wrapRef.current; if (!wrap) return
    const { width: vw, height: vh } = wrap.getBoundingClientRect(); const s = st.current
    const p = proj(center[1], center[0], vw, vh, 40, s.zoom, 0, 0)
    s.panX = vw / 2 - p.x; s.panY = vh / 2 - p.y; render()
  }, [center, render])

  return (
    <div ref={wrapRef} role="img" aria-label="Interactive map" {...props} className={cn("relative block min-h-[300px] overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div ref={tipRef} className="pointer-events-none absolute rounded bg-[var(--mn-surface-raised,#222)] px-2 py-1 text-xs text-[var(--mn-text,#eee)] shadow-lg opacity-0 transition-opacity" />
      <div className="absolute bottom-2 left-2 flex gap-2 text-[0.65rem]">
        {(["active", "warning", "danger"] as const).map((c) => (
          <span key={c} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[c] }} />
            <span className="capitalize text-[var(--mn-text-muted,#999)]">{c}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
