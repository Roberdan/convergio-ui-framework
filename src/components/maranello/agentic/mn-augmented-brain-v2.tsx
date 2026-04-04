"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Pause, Play } from "lucide-react"
import type {
  BrainV2Node, BrainV2Synapse, BrainV2Stats, BrainV2Palette,
  NodePos, SynapseParticle,
} from "./mn-augmented-brain-v2.helpers"
import {
  readBrainV2Palette, computeV2Layout, drawBrainV2Frame,
} from "./mn-augmented-brain-v2.helpers"

/* ── CVA ───────────────────────────────────────────────────── */
const brainV2Wrap = cva("relative block", {
  variants: {
    size: { sm: "max-w-xs", md: "max-w-md", lg: "max-w-xl", fluid: "w-full" },
  },
  defaultVariants: { size: "md" },
})

/* ── Props ─────────────────────────────────────────────────── */
export interface MnAugmentedBrainV2Props
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof brainV2Wrap> {
  nodes: BrainV2Node[]
  synapses: BrainV2Synapse[]
  stats?: BrainV2Stats
  title?: string
  onNodeClick?: (node: BrainV2Node) => void
  showControls?: boolean
  height?: number
  ariaLabel?: string
}

/* ── Stats bar ─────────────────────────────────────────────── */
function StatsBar({ title, stats, playing, onToggle, showControls }: {
  title: string; stats?: BrainV2Stats
  playing: boolean; onToggle: () => void; showControls: boolean
}) {
  const parts: string[] = []
  if (stats?.sessions != null) parts.push(`${stats.sessions} sessions`)
  if (stats?.plans != null) parts.push(`${stats.plans} plans`)
  if (stats?.tasks != null) parts.push(`${stats.tasks} tasks`)
  if (stats?.synapses != null) parts.push(`${stats.synapses} synapses`)

  return (
    <div className="flex items-center justify-between gap-2 rounded-t-lg border-b px-3 py-1.5 text-xs bg-muted/30 text-muted-foreground border-border">
      <span className="font-semibold tracking-wide uppercase">{title}</span>
      <div className="flex items-center gap-3">
        {parts.length > 0 && (
          <span className="hidden sm:inline">{parts.join(" \u00b7 ")}</span>
        )}
        {showControls && (
          <button
            type="button" onClick={onToggle}
            className="inline-flex items-center justify-center rounded p-0.5 hover:bg-muted"
            aria-label={playing ? "Pause animation" : "Play animation"}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Component ─────────────────────────────────────────────── */
export function MnAugmentedBrainV2({
  nodes, synapses, stats, title = "AUGMENTED BRAIN",
  onNodeClick, showControls = true,
  height = 500, ariaLabel = "Augmented brain visualization",
  size = "md", className, ...rest
}: MnAugmentedBrainV2Props) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)
  const hovRef = React.useRef<string | null>(null)
  const posRef = React.useRef<NodePos[]>([])
  const particlesRef = React.useRef<SynapseParticle[]>([])
  const palRef = React.useRef<BrainV2Palette | null>(null)
  const [playing, setPlaying] = React.useState(true)

  const reducedMotion = React.useMemo(
    () => typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  const effectivePlaying = playing && !reducedMotion

  React.useEffect(() => {
    const canvas = cvs.current, host = wrap.current
    if (!canvas || !host) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    palRef.current = readBrainV2Palette(host)
    const obs = new MutationObserver(() => {
      palRef.current = readBrainV2Palette(host)
    })
    const html = host.ownerDocument.documentElement
    obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] })

    const setup = () => {
      const dpr = window.devicePixelRatio || 1
      const w = Math.max(host.clientWidth || 320, 200)
      canvas.width = w * dpr
      canvas.height = height * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      posRef.current = computeV2Layout(nodes ?? [], w, height)
    }
    setup()

    if (!reducedMotion) {
      const activeSyns = synapses
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.active)
      particlesRef.current = activeSyns.flatMap(({ i }) =>
        Array.from({ length: 3 }, () => ({
          synIdx: i,
          t: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
        })),
      )
    } else {
      particlesRef.current = []
    }

    const loop = () => {
      const lw = canvas.clientWidth || 320
      const lh = canvas.clientHeight || height
      const pal = palRef.current
      if (!pal) { raf.current = requestAnimationFrame(loop); return }

      if (effectivePlaying) {
        for (const p of particlesRef.current) {
          p.t += p.speed
          if (p.t > 1) p.t -= 1
        }
      }

      drawBrainV2Frame(
        ctx, lw, lh, posRef.current, synapses ?? [],
        effectivePlaying ? particlesRef.current : [],
        hovRef.current, pal,
      )
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(setup) : null
    ro?.observe(host)

    return () => {
      cancelAnimationFrame(raf.current)
      ro?.disconnect()
      obs.disconnect()
    }
  }, [nodes, synapses, height, reducedMotion, effectivePlaying])

  const hitTest = React.useCallback((mx: number, my: number): BrainV2Node | null => {
    for (let i = posRef.current.length - 1; i >= 0; i--) {
      const p = posRef.current[i]
      if (Math.hypot(mx - p.x, my - p.y) <= p.r + 3) return p.node
    }
    return null
  }, [])

  const coords = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = cvs.current?.getBoundingClientRect()
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : null
  }, [])

  const handleMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = coords(e)
    if (!c) return
    const nid = hitTest(c.x, c.y)?.id ?? null
    if (nid !== hovRef.current) {
      hovRef.current = nid
      if (cvs.current) cvs.current.style.cursor = nid ? "pointer" : "default"
    }
  }, [hitTest, coords])

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick) return
    const c = coords(e)
    if (!c) return
    const hit = hitTest(c.x, c.y)
    if (hit) onNodeClick(hit)
  }, [onNodeClick, hitTest, coords])

  const handleLeave = React.useCallback(() => { hovRef.current = null }, [])

  const ariaDesc = React.useMemo(() => {
    const safe = nodes ?? []
    return `${ariaLabel}: ${safe.length} nodes, ${(synapses ?? []).length} synapses`
  }, [nodes, synapses, ariaLabel])

  return (
    <div ref={wrap} className={cn(brainV2Wrap({ size }), className)} {...rest}>
      <StatsBar
        title={title} stats={stats} playing={playing}
        onToggle={() => setPlaying((p) => !p)} showControls={showControls}
      />
      <canvas
        ref={cvs} role="img" aria-label={ariaDesc} className="block w-full"
        onClick={handleClick} onMouseMove={handleMove} onMouseLeave={handleLeave}
        tabIndex={0}
      />
    </div>
  )
}

export { brainV2Wrap }
