"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  type GanttTask, type GanttDependency,
  BAR_RADIUS, STATUS_CFG, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
  parseD, daysBetween, fmtS, addM,
  flattenVisible, buildRange, buildDeps,
} from "./mn-gantt.helpers"

export type { GanttTaskStatus, GanttDependency, GanttTask } from "./mn-gantt.helpers"

/* ── Types ─────────────────────────────────────────────────── */

export interface MnGanttProps extends React.HTMLAttributes<HTMLDivElement> {
  tasks: GanttTask[]; dependencies?: GanttDependency[]
  labelWidth?: number; rowHeight?: number; showToday?: boolean
}

/* ── CVA ───────────────────────────────────────────────────── */

const ganttRoot = cva(
  "relative overflow-hidden rounded-lg border border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface,theme(colors.background))]",
)

/* ── Sub-components ────────────────────────────────────────── */

function TimelineHeader({ months, ppd }: { months: { date: Date; label: string; year: number }[]; ppd: number }) {
  return (
    <div className="flex h-14 border-b border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface-raised,theme(colors.muted))]">
      {months.map((m, i) => {
        const w = daysBetween(m.date, i < months.length - 1 ? months[i + 1].date : addM(m.date, 1)) * ppd
        const sy = i === 0 || m.year !== months[i - 1].year
        return (
          <div key={i} className="shrink-0 border-r border-[var(--mn-border,theme(colors.border))] flex flex-col justify-center items-center text-[10px] leading-tight" style={{ width: w }}>
            {sy && <span className="font-bold text-[var(--mn-text,theme(colors.foreground))]">{m.year}</span>}
            <span className="text-[var(--mn-text-muted,theme(colors.muted-foreground))]">{m.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function TodayMarker({ left }: { left: number }) {
  return (
    <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left }}>
      <div className="absolute inset-y-0 w-0.5 bg-[var(--mn-info,#3b82f6)]" />
      <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded bg-[var(--mn-info,#3b82f6)] px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap shadow-sm">
        TODAY
      </span>
    </div>
  )
}

function TaskBar({ task, left, width, rowH, depth, isSummary }: {
  task: GanttTask; left: number; width: number; rowH: number; depth: number; isSummary?: boolean
}) {
  const cfg = STATUS_CFG[task.status ?? "planned"] ?? STATUS_CFG.planned
  const bH = depth > 0 ? 14 : 20
  const top = (rowH - bH) / 2
  const barW = Math.max(width, 24)

  if (task.milestone) {
    const sz = 14
    return (
      <div className="absolute z-10" style={{ left: left - sz / 2, top: (rowH - sz) / 2, width: sz, height: sz }}
        title={`${task.title} (milestone)\n${fmtS(parseD(task.start))}`}>
        <div className="h-full w-full rotate-45 rounded-[2px] shadow-[0_1px_3px_rgba(0,0,0,.4)]"
          style={{ background: `linear-gradient(135deg, ${cfg.bar}, ${cfg.grad})` }} />
      </div>
    )
  }

  if (isSummary) {
    return (
      <div className="absolute z-10" title={`${task.title} (collapsed)`}
        style={{ left, top: (rowH - 8) / 2, width: barW, height: 8, borderRadius: BAR_RADIUS, opacity: 0.75,
          background: `repeating-linear-gradient(135deg,${cfg.bar},${cfg.bar} 4px,transparent 4px,transparent 8px)` }} />
    )
  }

  return (
    <div className="absolute z-10 overflow-hidden flex items-center shadow-[0_1px_3px_rgba(0,0,0,.3)]"
      style={{ left, top, width: barW, height: bH, borderRadius: BAR_RADIUS,
        background: `linear-gradient(180deg, ${cfg.bar}, color-mix(in srgb, ${cfg.grad} 80%, black))` }}
      title={`${task.title}\n${fmtS(parseD(task.start))} \u2013 ${fmtS(parseD(task.end))}`}>
      {task.progress != null && task.progress > 0 && (
        <div className="absolute inset-0 bg-white/20 origin-left transition-[width] duration-300"
          style={{ width: `${Math.min(task.progress * 100, 100)}%` }} />
      )}
      <span className="relative truncate px-1.5 text-[11px] font-semibold leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.5)]">{task.title}</span>
    </div>
  )
}

function DepArrows({ deps, pos }: { deps: GanttDependency[]; pos: Map<string, { x: number; y: number; w: number }> }) {
  return (
    <svg className="absolute inset-0 z-0 pointer-events-none overflow-visible" aria-hidden="true">
      <defs>
        <marker id="mn-gantt-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--mn-text-muted,#888)" />
        </marker>
      </defs>
      {deps.map((d, i) => {
        const f = pos.get(d.from), t = pos.get(d.to)
        if (!f || !t) return null
        const gap = 12
        const sx = f.x + f.w, sy = f.y
        const ex = t.x, ey = t.y
        const mx = sx + gap
        return (
          <path key={i}
            d={`M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`}
            fill="none" stroke="var(--mn-text-muted,#888)" strokeWidth="1.5"
            strokeDasharray="4 2" markerEnd="url(#mn-gantt-arrow)" />
        )
      })}
    </svg>
  )
}

/* ── Zoom controls ─────────────────────────────────────────── */

function ZoomControls({ zoom, onZoom }: { zoom: number; onZoom: (z: number) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded border border-[var(--mn-border)] bg-[var(--mn-surface)]">
      <button type="button" aria-label="Zoom in (more detail)"
        className="px-2 py-0.5 text-xs font-bold text-[var(--mn-text-muted)] hover:text-[var(--mn-text)] disabled:opacity-40"
        disabled={zoom <= ZOOM_MIN} onClick={() => onZoom(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))}>{"\u2212"}</button>
      <span className="min-w-[3ch] text-center text-[10px] tabular-nums text-[var(--mn-text-muted)]">{Math.round((1 / zoom) * 100)}%</span>
      <button type="button" aria-label="Zoom out (overview)"
        className="px-2 py-0.5 text-xs font-bold text-[var(--mn-text-muted)] hover:text-[var(--mn-text)] disabled:opacity-40"
        disabled={zoom >= ZOOM_MAX} onClick={() => onZoom(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))}>+</button>
      <button type="button" aria-label="Fit timeline to view"
        className="border-l border-[var(--mn-border)] px-2 py-0.5 text-[10px] font-medium text-[var(--mn-text-muted)] hover:text-[var(--mn-text)]"
        onClick={() => onZoom(1)}>Fit</button>
    </div>
  )
}

/* ── Main component ────────────────────────────────────────── */

function MnGantt({ tasks, dependencies, labelWidth = 240, rowHeight = 38, showToday = true, className, ...props }: MnGanttProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const [zoom, setZoom] = React.useState(1)

  if (!tasks.length) return null

  const toggle = (id: string) => setCollapsed((prev) => { const s = new Set(prev); if (s.has(id)) { s.delete(id) } else { s.add(id) } return s })
  const rows = flattenVisible(tasks, collapsed)
  const range = buildRange(tasks)
  const allDeps = dependencies ?? buildDeps(tasks)
  const basePpd = Math.max(3, 900 / range.totalDays)
  const ppd = basePpd / zoom
  const tlW = range.totalDays * ppd
  const todayL = daysBetween(range.min, new Date()) * ppd

  const pos = new Map<string, { x: number; y: number; w: number }>()
  rows.forEach((r, i) => {
    const x = daysBetween(range.min, parseD(r.task.start)) * ppd
    pos.set(r.task.id, { x, y: i * rowHeight + rowHeight / 2, w: daysBetween(parseD(r.task.start), parseD(r.task.end)) * ppd })
  })

  return (
    <div className={cn(ganttRoot(), className)} role="figure" aria-label="Gantt timeline" {...props}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border,theme(colors.border))] px-3 py-1.5">
        <ZoomControls zoom={zoom} onZoom={setZoom} />
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-[var(--mn-text-muted,theme(colors.muted-foreground))]">
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1 capitalize">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: v.bar }} />{k}
            </span>
          ))}
          {showToday && <span className="flex items-center gap-1"><span className="inline-block h-2 w-0.5 bg-[var(--mn-info,#3b82f6)]" />Today</span>}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="shrink-0 border-r border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface-raised,theme(colors.muted))]" style={{ width: labelWidth }}>
          <div className="flex h-14 items-center px-3 border-b border-[var(--mn-border,theme(colors.border))] text-sm font-semibold text-[var(--mn-text-muted,theme(colors.muted-foreground))]">Task</div>
          {rows.map((r) => (
            <div key={r.task.id} className="flex items-center gap-2 border-b border-[var(--mn-border,theme(colors.border))] px-3 text-sm"
              style={{ height: rowHeight, paddingLeft: r.depth > 0 ? 28 : undefined }}>
              {r.isParent ? (
                <button type="button" onClick={() => toggle(r.task.id)}
                  className="w-4 shrink-0 text-[var(--mn-text-muted,theme(colors.muted-foreground))] hover:text-[var(--mn-text,theme(colors.foreground))] text-xs transition-transform"
                  aria-label={collapsed.has(r.task.id) ? "Expand" : "Collapse"}>
                  <span className={cn("inline-block transition-transform", !collapsed.has(r.task.id) && "rotate-90")}>{"\u25B6"}</span>
                </button>
              ) : r.depth === 0 ? <span className="w-4 shrink-0" /> : null}
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: (STATUS_CFG[r.task.status ?? "planned"] ?? STATUS_CFG.planned).bar }} />
              <span className={cn("truncate", r.depth > 0 ? "text-[var(--mn-text-muted,theme(colors.muted-foreground))]" : "font-medium text-[var(--mn-text,theme(colors.foreground))]")}>{r.task.title}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden scroll-smooth">
          <div className="relative" style={{ width: tlW, minWidth: "100%" }}>
            <TimelineHeader months={range.months} ppd={ppd} />
            <div className="relative" style={{ height: rows.length * rowHeight }}>
              {range.months.map((m, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-[var(--mn-border,theme(colors.border))] opacity-30" style={{ left: daysBetween(range.min, m.date) * ppd }} />
              ))}
              {showToday && todayL >= 0 && todayL <= tlW && <TodayMarker left={todayL} />}
              {allDeps.length > 0 && <DepArrows deps={allDeps} pos={pos} />}
              {rows.map((r, i) => {
                const hasSummary = !!r.summary
                const sD = hasSummary ? r.summary!.start : parseD(r.task.start)
                const eD = hasSummary ? r.summary!.end : parseD(r.task.end)
                const x = daysBetween(range.min, sD) * ppd, w = daysBetween(sD, eD) * ppd
                return (
                  <div key={r.task.id}
                    className={cn("relative border-b border-[var(--mn-border,theme(colors.border))]",
                      i % 2 === 1 && "bg-[var(--mn-surface-raised,theme(colors.muted))]/[.03]")}
                    style={{ height: rowHeight }}>
                    <TaskBar task={r.task} left={x} width={w} rowH={rowHeight} depth={r.depth} isSummary={hasSummary} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { MnGantt, ganttRoot }
