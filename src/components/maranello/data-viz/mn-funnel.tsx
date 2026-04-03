"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface FunnelStage {
  label: string; count: number; color?: string
  holdCount?: number; withdrawnCount?: number
}
export interface FunnelData {
  pipeline: FunnelStage[]; total?: number
  onHold?: { count: number; color?: string }
  withdrawn?: { count: number; color?: string }
}
export interface MnFunnelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof funnelVariants> {
  data: FunnelData | null; showConversion?: boolean; animate?: boolean
  onStageClick?: (stage: FunnelStage, index: number) => void
}

const BAR_H = 38, GAP = 24, RAD = 6, VB_W = 420, PAD = 16, MIN_BAR = 0.35
const PIPE_L = 80, PIPE_W = 260
const FONT_D = "var(--mn-font-display, 'Barlow Condensed', sans-serif)"
const FONT_B = "var(--mn-font-body, 'Inter', sans-serif)"
const MUTED = "var(--mn-text-muted, #9ca3af)"

const funnelVariants = cva("relative w-full", {
  variants: { size: { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", full: "w-full" } },
  defaultVariants: { size: "full" },
})

function hexLum(hex: string): number {
  let h = (hex || "#888888").replace("#", "")
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const [r, g, b] = [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)].map((s) => parseInt(s, 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function autoTC(bg: string) { return hexLum(bg) > 0.35 ? "var(--mn-text-strong, #111)" : "var(--mn-text-on-accent, #fff)" }
function trapPath(x1: number, w1: number, x2: number, w2: number, y1: number, y2: number) {
  const [l1, r1, l2, r2, my] = [x1, x1 + w1, x2, x2 + w2, (y1 + y2) / 2]
  return `M${l1},${y1} C${l1},${my} ${l2},${my} ${l2},${y2} L${r2},${y2} C${r2},${my} ${r1},${my} ${r1},${y1} Z`
}
function cumReach(counts: number[]) {
  const r = new Array<number>(counts.length); let s = 0
  for (let i = counts.length - 1; i >= 0; i--) { s += counts[i]; r[i] = s }
  return r
}
function resColor(c: string | undefined, fb: string) { return c && /^#[0-9A-Fa-f]{3,6}$/.test(c) ? c : fb }

function ExitPill({ ax, by, side, count, color, icon }: {
  ax: number; by: number; side: "left" | "right"; count: number; color: string; icon: string
}) {
  const cy = by + BAR_H / 2, pw = 44, ph = 20, isL = side === "left"
  const px = isL ? ax - 6 - pw : ax + 6, le = isL ? px + pw : px
  return (
    <g>
      <line x1={ax} y1={cy} x2={le} y2={cy} stroke={color} strokeWidth={1.5} strokeDasharray="3 2" opacity={0.5} />
      <rect x={px} y={cy - ph / 2} width={pw} height={ph} rx={ph / 2} fill={color} opacity={0.18} />
      <text x={px + pw / 2} y={cy + 3.5} textAnchor="middle" fontSize={10} fill={color} fontWeight={600} style={{ fontFamily: FONT_D }}>{icon} {count}</text>
    </g>
  )
}

function StageRow({ stage, i, next, barW, barX, y, total, reach, rows, animate, hc, wc, onClick }: {
  stage: FunnelStage; i: number; next: FunnelStage | null; barW: number; barX: number
  y: number; total: number; reach: number[]; rows: number; animate: boolean
  hc: string; wc: string; onClick?: (s: FunnelStage, i: number) => void
}) {
  const [hov, setHov] = React.useState(false)
  const [sel, setSel] = React.useState(false)
  const sc = resColor(stage.color, "var(--mn-border-strong, #6b7280)")
  const tc = autoTC(sc)
  const cTxt = total > 0 ? `${stage.count} (${Math.round((stage.count / total) * 100)}%)` : String(stage.count)
  const cx = PIPE_L + PIPE_W / 2

  let conn: React.ReactNode = null
  if (next && i < rows - 1) {
    const maxC = reach[0] || 1
    const nW = Math.max(PIPE_W * MIN_BAR, (next.count / maxC) * PIPE_W)
    const nX = PIPE_L + (PIPE_W - nW) / 2
    const rate = reach[i] > 0 ? Math.round((reach[i + 1] / reach[i]) * 100) : 0
    conn = (<>
      <path d={trapPath(barX, barW, nX, nW, y + BAR_H, y + BAR_H + GAP)} fill={sc} opacity={0.12} />
      <text x={cx} y={y + BAR_H + GAP / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={MUTED} fontWeight={500} style={{ fontFamily: FONT_D }}>↓ {rate}%</text>
    </>)
  }
  return (
    <g className={cn("transition-opacity duration-300 ease-out", animate && "animate-in fade-in slide-in-from-left-3")}
      style={animate ? { animationDelay: `${i * 60 + 30}ms`, animationFillMode: "both" } : undefined}>
      {conn}
      <rect x={barX} y={y} width={barW} height={BAR_H} rx={RAD} fill={sc} style={{ filter: hov ? "brightness(1.3)" : undefined, transition: "filter 0.15s" }} />
      {sel && <rect x={barX - 2} y={y - 2} width={barW + 4} height={BAR_H + 4} fill="none" stroke="var(--mn-accent, #FFC72C)" strokeWidth={2} rx={RAD} />}
      <text x={cx} y={y + Math.round(BAR_H * 0.37)} textAnchor="middle" fontSize={11} fill={tc} fontWeight={600} style={{ fontFamily: FONT_B }}>{stage.label}</text>
      <text x={cx} y={y + Math.round(BAR_H * 0.76)} textAnchor="middle" fontSize={14} fill={tc} fontWeight={700} style={{ fontFamily: FONT_D }}>{cTxt}</text>
      {stage.holdCount ? <ExitPill ax={barX} by={y} side="left" count={stage.holdCount} color={hc} icon="⏸" /> : null}
      {stage.withdrawnCount ? <ExitPill ax={barX + barW} by={y} side="right" count={stage.withdrawnCount} color={wc} icon="✕" /> : null}
      <rect x={barX} y={y} width={barW} height={BAR_H} fill="transparent" cursor="pointer" pointerEvents="all"
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={() => { setSel((s) => !s); onClick?.(stage, i) }}>
        <title>{`${stage.label}: ${stage.count}`}</title>
      </rect>
    </g>
  )
}

export function MnFunnel({ data, animate = true, size, onStageClick, className, ...props }: MnFunnelProps) {
  if (!data?.pipeline?.length) {
    return (
      <div {...props} className={cn(funnelVariants({ size }), className)} role="img" aria-label="Pipeline funnel">
        <p className="py-6 text-center text-sm text-[var(--mn-text-muted,_#9ca3af)]">No pipeline stages available.</p>
      </div>
    )
  }
  const pipe = data.pipeline, rows = pipe.length
  const maxC = Math.max(...pipe.map((s) => s.count || 1))
  const total = data.total || pipe.reduce((a, s) => a + s.count, 0)
  const reach = cumReach(pipe.map((s) => s.count))
  const svgH = PAD * 2 + rows * BAR_H + (rows - 1) * GAP
  const hc = resColor(data.onHold?.color, "#ea580c"), wc = resColor(data.withdrawn?.color, "#666666")

  return (
    <div {...props} className={cn(funnelVariants({ size }), className)} role="img" aria-label="Pipeline funnel">
      <svg viewBox={`0 0 ${VB_W} ${svgH}`} preserveAspectRatio="xMidYMid meet" className="h-auto w-full">
        {pipe.map((stage, i) => {
          const barW = Math.max(PIPE_W * MIN_BAR, (stage.count / maxC) * PIPE_W)
          const barX = PIPE_L + (PIPE_W - barW) / 2
          return (
            <StageRow key={stage.label + i} stage={stage} i={i} next={i < rows - 1 ? pipe[i + 1] : null}
              barW={barW} barX={barX} y={PAD + i * (BAR_H + GAP)} total={total} reach={reach}
              rows={rows} animate={animate} hc={hc} wc={wc} onClick={onStageClick} />
          )
        })}
        {data.onHold && data.onHold.count > 0 && (
          <g>
            <circle cx={PIPE_L} cy={svgH - 4} r={4} fill={hc} opacity={0.8} />
            <text x={PIPE_L + 8} y={svgH - 1} fontSize={9} fill={MUTED} fontWeight={500} style={{ fontFamily: FONT_B }}>⏸ On Hold: {data.onHold.count}</text>
          </g>
        )}
        {data.withdrawn && data.withdrawn.count > 0 && (
          <g>
            <circle cx={PIPE_L + PIPE_W / 2 + 20} cy={svgH - 4} r={4} fill={wc} opacity={0.8} />
            <text x={PIPE_L + PIPE_W / 2 + 28} y={svgH - 1} fontSize={9} fill={MUTED} fontWeight={500} style={{ fontFamily: FONT_B }}>✕ Withdrawn: {data.withdrawn.count}</text>
          </g>
        )}
      </svg>
    </div>
  )
}
