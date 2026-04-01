"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────────── */

export type GanttTaskStatus = "active" | "planned" | "completed" | "on-hold" | "withdrawn"
export interface GanttDependency { from: string; to: string }
export interface GanttTask {
  id: string; title: string; start: string; end: string
  status?: GanttTaskStatus; progress?: number; milestone?: boolean
  dependencies?: string[]; children?: GanttTask[]
}
export interface MnGanttProps extends React.HTMLAttributes<HTMLDivElement> {
  tasks: GanttTask[]; dependencies?: GanttDependency[]
  labelWidth?: number; rowHeight?: number; showToday?: boolean
}

/* ── Constants ─────────────────────────────────────────────── */

const MS_DAY = 864e5
const BAR_MIN = 60
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const STATUS: Record<string, { bar: string }> = {
  active:    { bar: "#22c55e" },
  planned:   { bar: "#f59e0b" },
  completed: { bar: "#3b82f6" },
  "on-hold": { bar: "#f97316" },
  withdrawn: { bar: "#9ca3af" },
}

/* ── Helpers ───────────────────────────────────────────────── */

function parseD(s: string) { return new Date(s) }
function days(a: Date, b: Date) { return (b.getTime() - a.getTime()) / MS_DAY }
function fmtS(d: Date) { return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}` }
function addM(d: Date, n: number) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)) }
function mStart(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)) }

type FlatRow = { task: GanttTask; depth: number; isParent: boolean; summary?: { start: Date; end: Date } }

function flattenAll(tasks: GanttTask[]): GanttTask[] {
  return tasks.flatMap((t) => t.children ? [t, ...t.children] : [t])
}

function childSpan(parent: GanttTask): { start: Date; end: Date } {
  let lo = Infinity, hi = -Infinity
  for (const c of parent.children!) {
    const s = parseD(c.start).getTime(), e = parseD(c.end).getTime()
    if (s < lo) lo = s; if (e > hi) hi = e
  }
  return { start: new Date(lo), end: new Date(hi) }
}

function flattenVisible(tasks: GanttTask[], collapsed: Set<string>): FlatRow[] {
  const rows: FlatRow[] = []
  for (const t of tasks) {
    const hasKids = !!t.children?.length
    if (hasKids && collapsed.has(t.id)) {
      rows.push({ task: t, depth: 0, isParent: true, summary: childSpan(t) })
    } else {
      rows.push({ task: t, depth: 0, isParent: hasKids })
      if (hasKids) for (const c of t.children!) rows.push({ task: c, depth: 1, isParent: false })
    }
  }
  return rows
}

function buildRange(tasks: GanttTask[]) {
  let lo = Infinity, hi = -Infinity
  for (const t of flattenAll(tasks)) {
    const s = parseD(t.start).getTime(), e = parseD(t.end).getTime()
    if (s < lo) lo = s; if (e > hi) hi = e
  }
  const min = addM(mStart(new Date(lo)), -1), max = addM(mStart(new Date(hi)), 2)
  const months: { date: Date; label: string; year: number }[] = []
  let cur = new Date(min)
  while (cur < max) {
    months.push({ date: new Date(cur), label: MON[cur.getUTCMonth()], year: cur.getUTCFullYear() })
    cur = addM(cur, 1)
  }
  return { min, max, months, totalDays: days(min, max) }
}

function buildDeps(tasks: GanttTask[]): GanttDependency[] {
  return flattenAll(tasks).flatMap((t) => (t.dependencies ?? []).map((from) => ({ from, to: t.id })))
}

/* ── CVA ───────────────────────────────────────────────────── */

const ganttRoot = cva(
  "relative overflow-hidden rounded-lg border border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface,theme(colors.background))]",
)

/* ── Sub-components ────────────────────────────────────────── */

function TimelineHeader({ months, ppd }: { months: { date: Date; label: string; year: number }[]; ppd: number }) {
  return (
    <div className="flex h-12 border-b border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface-raised,theme(colors.muted))]">
      {months.map((m, i) => {
        const w = days(m.date, i < months.length - 1 ? months[i + 1].date : addM(m.date, 1)) * ppd
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
    <div className="absolute top-0 bottom-0 w-0.5 bg-[var(--mn-info,#3b82f6)] z-20 pointer-events-none" style={{ left }}>
      <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded bg-[var(--mn-info,#3b82f6)] px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap">TODAY</span>
    </div>
  )
}

function TaskBar({ task, left, width, rowH, depth, isSummary }: {
  task: GanttTask; left: number; width: number; rowH: number; depth: number; isSummary?: boolean
}) {
  const c = STATUS[task.status ?? "planned"] ?? STATUS.planned
  const barW = Math.max(width, BAR_MIN)
  const bH = depth > 0 ? 14 : 20
  const top = (rowH - bH) / 2
  const shadow = "0 1px 2px rgba(0,0,0,0.6)"
  if (task.milestone) {
    return (
      <div className="absolute z-10" style={{ left: left - 7, top: (rowH - 14) / 2, width: 14, height: 14 }}>
        <div className="w-full h-full rotate-45 rounded-sm" style={{ background: c.bar }} />
      </div>
    )
  }
  if (isSummary) {
    return (
      <div className="absolute z-10 rounded-[3px]" title={`${task.title} (collapsed)`}
        style={{ left, top: (rowH - 8) / 2, width: barW, height: 8, background: `repeating-linear-gradient(135deg,${c.bar},${c.bar} 4px,transparent 4px,transparent 8px)`, opacity: 0.75 }} />
    )
  }
  return (
    <div className="absolute z-10 rounded-[3px] overflow-hidden flex items-center" style={{ left, top, width: barW, height: bH, background: c.bar }}
      title={`${task.title}\n${fmtS(parseD(task.start))} – ${fmtS(parseD(task.end))}`}>
      {task.progress != null && task.progress > 0 && (
        <div className="absolute inset-0 bg-white/20 origin-left" style={{ width: `${Math.min(task.progress * 100, 100)}%` }} />
      )}
      <span className="relative truncate px-1.5 text-[11px] font-semibold leading-none text-white" style={{ textShadow: shadow }}>{task.title}</span>
    </div>
  )
}

function DepArrows({ deps, pos }: { deps: GanttDependency[]; pos: Map<string, { x: number; y: number; w: number }> }) {
  return (
    <svg className="absolute inset-0 z-0 pointer-events-none overflow-visible" aria-hidden="true">
      <defs><marker id="mn-gantt-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--mn-text-muted,#888)" /></marker></defs>
      {deps.map((d, i) => {
        const f = pos.get(d.from), t = pos.get(d.to)
        if (!f || !t) return null
        return <path key={i} d={`M${f.x + f.w},${f.y} H${f.x + f.w + 12} V${t.y} H${t.x}`} fill="none" stroke="var(--mn-text-muted,#888)" strokeWidth="1.5" markerEnd="url(#mn-gantt-arrow)" />
      })}
    </svg>
  )
}

/* ── Main component ────────────────────────────────────────── */

function MnGantt({ tasks, dependencies, labelWidth = 200, rowHeight = 36, showToday = true, className, ...props }: MnGanttProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  if (!tasks.length) return null

  const toggle = (id: string) => setCollapsed((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const rows = flattenVisible(tasks, collapsed)
  const range = buildRange(tasks)
  const allDeps = dependencies ?? buildDeps(tasks)
  const ppd = Math.max(3, 900 / range.totalDays)
  const tlW = range.totalDays * ppd
  const todayL = days(range.min, new Date()) * ppd

  const pos = new Map<string, { x: number; y: number; w: number }>()
  rows.forEach((r, i) => {
    const x = days(range.min, parseD(r.task.start)) * ppd
    pos.set(r.task.id, { x, y: i * rowHeight + rowHeight / 2, w: days(parseD(r.task.start), parseD(r.task.end)) * ppd })
  })

  return (
    <div className={cn(ganttRoot(), className)} role="figure" aria-label="Gantt timeline" {...props}>
      <div className="flex">
        {/* Sidebar */}
        <div className="shrink-0 border-r border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface-raised,theme(colors.muted))]" style={{ width: labelWidth }}>
          <div className="h-12 flex items-center px-3 border-b border-[var(--mn-border,theme(colors.border))] text-sm font-semibold text-[var(--mn-text-muted,theme(colors.muted-foreground))]">Task</div>
          {rows.map((r) => (
            <div key={r.task.id} className="flex items-center gap-2 border-b border-[var(--mn-border,theme(colors.border))] px-3 text-sm"
              style={{ height: rowHeight, paddingLeft: r.depth > 0 ? 28 : undefined }}>
              {r.isParent ? (
                <button type="button" onClick={() => toggle(r.task.id)}
                  className="w-4 shrink-0 text-[var(--mn-text-muted,theme(colors.muted-foreground))] hover:text-[var(--mn-text,theme(colors.foreground))] text-xs"
                  aria-label={collapsed.has(r.task.id) ? "Expand" : "Collapse"}>
                  {collapsed.has(r.task.id) ? "▶" : "▼"}
                </button>
              ) : r.depth === 0 ? <span className="w-4 shrink-0" /> : null}
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: (STATUS[r.task.status ?? "planned"] ?? STATUS.planned).bar }} />
              <span className={cn("truncate", r.depth > 0 ? "text-[var(--mn-text-muted,theme(colors.muted-foreground))]" : "font-medium text-[var(--mn-text,theme(colors.foreground))]")}>{r.task.title}</span>
            </div>
          ))}
        </div>
        {/* Timeline */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative" style={{ width: tlW, minWidth: "100%" }}>
            <TimelineHeader months={range.months} ppd={ppd} />
            <div className="relative" style={{ height: rows.length * rowHeight }}>
              {range.months.map((m, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-[var(--mn-border,theme(colors.border))] opacity-40" style={{ left: days(range.min, m.date) * ppd }} />
              ))}
              {showToday && todayL >= 0 && todayL <= tlW && <TodayMarker left={todayL} />}
              {allDeps.length > 0 && <DepArrows deps={allDeps} pos={pos} />}
              {rows.map((r, i) => {
                const hasSummary = !!r.summary
                const sD = hasSummary ? r.summary!.start : parseD(r.task.start)
                const eD = hasSummary ? r.summary!.end : parseD(r.task.end)
                const x = days(range.min, sD) * ppd, w = days(sD, eD) * ppd
                return (
                  <div key={r.task.id} className={cn("relative border-b border-[var(--mn-border,theme(colors.border))]", i % 2 === 1 && "bg-[var(--mn-surface-raised,theme(colors.muted))]/30")} style={{ height: rowHeight }}>
                    <TaskBar task={r.task} left={x} width={w} rowH={rowHeight} depth={r.depth} isSummary={hasSummary} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--mn-border,theme(colors.border))] px-3 py-1.5 text-[10px] text-[var(--mn-text-muted,theme(colors.muted-foreground))]">
        {Object.entries(STATUS).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1 capitalize"><span className="inline-block h-2 w-2 rounded-full" style={{ background: v.bar }} />{k}</span>
        ))}
        {showToday && <span className="flex items-center gap-1"><span className="inline-block h-2 w-0.5 bg-[var(--mn-info,#3b82f6)]" />Today</span>}
      </div>
    </div>
  )
}

export { MnGantt, ganttRoot }
