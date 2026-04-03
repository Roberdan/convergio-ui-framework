"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { type ActiveMsg, type Flash, drawFrame, setupCanvas } from "./mn-network-messages.helpers"

/* ── CVA wrapper ───────────────────────────────────────────── */
const networkWrap = cva("relative overflow-hidden", {
  variants: { size: { sm: "", md: "", lg: "", fluid: "h-full w-full" } },
  defaultVariants: { size: "fluid" },
})
type WrapSize = NonNullable<VariantProps<typeof networkWrap>["size"]>

/* ── Public types ──────────────────────────────────────────── */
export interface NetNode {
  id: string; label: string; x: number; y: number
  color?: string; size?: number
}
export interface NetMessage {
  from: string; to: string; color?: string
  speed?: number; size?: number; label?: string
}
export interface NetConnection { from: string; to: string; color?: string }
export interface NetworkMessagesController {
  send: (msg: NetMessage) => void
  burst: (msgs: NetMessage[]) => void
}

export interface MnNetworkMessagesProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof networkWrap> {
  nodes: NetNode[]
  connections: NetConnection[]
  width?: number
  height?: number
  particleTrail?: boolean
  glowEffect?: boolean
  onNodeClick?: (node: NetNode) => void
  controllerRef?: { current: NetworkMessagesController | null }
  /** Default node fill color (hex). */
  nodeColor?: string
  /** Accent / gradient-end color (hex). */
  accentColor?: string
  /** Node label color (hex or rgba). */
  labelColor?: string
  /** Canvas background overlay. */
  bgOverlay?: string
}

/* ── Component ─────────────────────────────────────────────── */
function MnNetworkMessages({
  nodes, connections, width, height,
  particleTrail = true, glowEffect = true,
  onNodeClick, controllerRef,
  nodeColor, accentColor,
  labelColor, bgOverlay = "rgba(3,7,12,0.36)",
  size = "fluid", className, ...rest
}: MnNetworkMessagesProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)
  const msgsRef = React.useRef<ActiveMsg[]>([])
  const flashesRef = React.useRef<Flash[]>([])
  const lastTs = React.useRef(0)

  const send = React.useCallback((msg: NetMessage) => {
    const map = new Map(nodes.map((n) => [n.id, n]))
    if (!map.get(msg.from) || !map.get(msg.to)) return
    msgsRef.current.push({
      ...msg, progress: 0,
      speed: Math.max(0.5, Math.min(3, msg.speed ?? 1)),
      size: msg.size ?? 4, trail: [],
    })
  }, [nodes])

  const burst = React.useCallback(
    (m: NetMessage[]) => m.forEach(send),
    [send],
  )

  React.useEffect(() => {
    if (controllerRef) controllerRef.current = { send, burst }
    return () => { if (controllerRef) controllerRef.current = null }
  }, [controllerRef, send, burst])

  React.useEffect(() => {
    const canvas = cvs.current, host = wrap.current
    if (!canvas || !host) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const w = width ?? Math.max(320, host.clientWidth || 640)
      const h = height ?? Math.max(220, host.clientHeight || 320)
      setupCanvas(canvas, w, h)
    }

    const cssv = (n: string, fb: string) => getComputedStyle(host).getPropertyValue(n).trim() || fb
    const rNodeColor = nodeColor || cssv("--mn-info", "#4EA8DE")
    const rAccentColor = accentColor || cssv("--mn-accent", "#FFC72C")
    const rLabelColor = labelColor || cssv("--mn-text", "#f5f1e6")

    const loop = (now: number) => {
      const dt = Math.min(48, lastTs.current ? now - lastTs.current : 16)
      lastTs.current = now
      drawFrame(
        ctx, canvas.clientWidth || 1, canvas.clientHeight || 1, dt,
        nodes, connections, msgsRef.current, flashesRef.current,
        { trail: particleTrail, glow: glowEffect, nodeColor: rNodeColor, accent: rAccentColor, label: rLabelColor, bg: bgOverlay },
      )
      raf.current = requestAnimationFrame(loop)
    }

    resize()
    raf.current = requestAnimationFrame(loop)
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null
    ro?.observe(host)
    return () => { cancelAnimationFrame(raf.current); ro?.disconnect() }
  }, [nodes, connections, particleTrail, glowEffect, width, height, nodeColor, accentColor, labelColor, bgOverlay])

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onNodeClick || !cvs.current) return
      const rect = cvs.current.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const w = cvs.current.clientWidth, h = cvs.current.clientHeight
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        if (Math.hypot(mx - n.x * w, my - n.y * h) <= (n.size ?? 10) + 3) {
          onNodeClick(n); return
        }
      }
    },
    [nodes, onNodeClick],
  )

  return (
    <div
      ref={wrap} role="img" aria-label="Network message flow"
      className={cn(networkWrap({ size: size as WrapSize }), className)}
      {...rest}
    >
      <canvas ref={cvs} className="block w-full h-full" onClick={handleClick} tabIndex={0} />
    </div>
  )
}

export { MnNetworkMessages, networkWrap }
