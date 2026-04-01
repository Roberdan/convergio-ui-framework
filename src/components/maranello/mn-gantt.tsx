"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// --- Types ---

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

// --- Helpers ---

const MS_DAY = 864e5
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const STATUS: Record<string, { bar: string; text: string }> = {
  active:    { bar: "var(--mn-success,#00A651)",  text: "white" },
  planned:   { bar: "var(--mn-warning,#F59E0B)",  text: "var(--mn-text,#111)" },
  completed: { bar: "var(--mn-info,#4EA8DE)",      text: "white" },
  "on-hold": { bar: "var(--mn-error,#D4622B)",     text: "white" },
  withdrawn: { bar: "var(--mn-text-muted,#6B7280)",text: "white" },
}

function parseD(s: string) { return new Date(s) }
function days(a: Date, b: Date) { return (b.getTime() - a.getTime()) / MS_DAY }
function fmtS(d: Date) { return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}` }
function addM(d: Date, n: number) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)) }
function mStart(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)) }

function flatten(tasks: GanttTask[]): GanttTask[] {
  return tasks.flatMap((t) => t.children ? [t, ...t.children] : [t])
}

function buildRange(tasks: GanttTask[]) {
  let lo = Infinity, hi = -Infinity
  for (const t of flatten(tasks)) {
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
  return flatten(tasks).flatMap((t) => (t.dependencies ?? []).map((from) => ({ from, to: t.id })))
}

// --- CVA ---

const ganttRoot = cva(
  "relative overflow-hidden rounded-lg border border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface,theme(colors.background))]",
)

// --- Sub-components ---

function TimelineHeader({ months, ppd }: {
  months: { date: Date; label: string; year: number }[]; ppd: number
}) {
  let prevY = -1
  return (
    <div className="flex h-12 border-b border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface-raised,theme(colors.muted))]">
      {months.map((m, i) => {
        const w = days(m.date, i < months.length - 1 ? months[i + 1].date : addM(m.date, 1)) * ppd
        const sy = m.year !== prevY; prevY = m.year
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

function TaskBar({ task, left, width, rowH, isChild }: {
  task: GanttTask; left: number; width: number; rowH: number; isChild?: boolean
}) {
  const c = STATUS[task.status ?? "planned"] ?? STATUS.planned
  const bH = isChild ? 14 : 20, top = (rowH - bH) / 2
  if (task.milestone) {
    return (
      <div className="absolute z-10" style={{ left: left - 7, top: (rowH - 14) / 2, width: 14, height: 14 }}>
        <div className="w-full h-full rotate-45 rounded-sm" style={{ background: c.bar }} />
      </div>
    )
  }
  return (
    <div className="absolute z-10 rounded-[3px] overflow-hidden flex items-center" style={{ left, top, width: Math.max(width, 2), height: bH, background: c.bar }} title={`${task.title}\n${fmtS(parseD(task.start))} – ${fmtS(parseD(task.end))}`}>
      {task.progress != null && task.progress > 0 && (
        <div className="absolute inset-0 bg-white/20 origin-left" style={{ width: `${Math.min(task.progress * 100, 100)}%` }} />
      )}
      {width > 50 && <span className="relative truncate px-1.5 text-[10px] font-semibold leading-none" style={{ color: c.text }}>{task.title}</span>}
    </div>
  )
}

function DepArrows({ deps, pos }: {
  deps: GanttDependency[]; pos: Map<string, { x: number; y: number; w: number }>
}) {
  return (
    <svg className="absolute inset-0 z-0 pointer-events-none overflow-visible" aria-hidden="true">
      <defs><marker id="mn-gantt-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--mn-text-muted,#888)" /></marker></defs>
      {deps.map((d, i) => {
        const f = pos.get(d.from), t = pos.get(d.to)
        if (!f || !t) return null
        const mx = f.x + f.w + 12
        return <path key={i} d={`M${f.x + f.w},${f.y} H${mx} V${t.y} H${t.x}`} fill="none" stroke="var(--mn-text-muted,#888)" strokeWidth="1.5" markerEnd="url(#mn-gantt-arrow)" />
      })}
    </svg>
  )
}

// --- Main component ---

function MnGantt({ tasks, dependencies, labelWidth = 200, rowHeight = 36, showToday = true, className, ...props }: MnGanttProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  if (!tasks.length) return null

  const flat = flatten(tasks)
  const range = buildRange(tasks)
  const allDeps = dependencies ?? buildDeps(tasks)
  const ppd = Math.max(3, 900 / range.totalDays)
  const tlW = range.totalDays * ppd
  const todayL = days(range.min, new Date()) * ppd

  const pos = new Map<string, { x: number; y: number; w: number }>()
  flat.forEach((t, i) => {
    const x = days(range.min, parseD(t.start)) * ppd
    pos.set(t.id, { x, y: i * rowHeight + rowHeight / 2, w: days(parseD(t.start), parseD(t.end)) * ppd })
  })

  return (
    <div className={cn(ganttRoot(), className)} role="figure" aria-label="Gantt timeline" {...props}>
      <div className="flex">
        <div className="shrink-0 border-r border-[var(--mn-border,theme(colors.border))] bg-[var(--mn-surface-raised,theme(colors.muted))]" style={{ width: labelWidth }}>
          <div className="h-12 flex items-center px-3 border-b border-[var(--mn-border,theme(colors.border))] text-xs font-semibold text-[var(--mn-text-muted,theme(colors.muted-foreground))]">Task</div>
          {flat.map((t) => {
            const isChild = tasks.every((p) => p.id !== t.id)
            return (
              <div key={t.id} className="flex items-center gap-2 border-b border-[var(--mn-border,theme(colors.border))] px-3 text-xs truncate" style={{ height: rowHeight }}>
                {isChild && <span className="w-3" />}
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: (STATUS[t.status ?? "planned"] ?? STATUS.planned).bar }} />
                <span className={cn("truncate", isChild ? "text-[var(--mn-text-muted,theme(colors.muted-foreground))]" : "font-medium text-[var(--mn-text,theme(colors.foreground))]")}>{t.title}</span>
              </div>
            )
          })}
        </div>
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative" style={{ width: tlW, minWidth: "100%" }}>
            <TimelineHeader months={range.months} ppd={ppd} />
            <div className="relative" style={{ height: flat.length * rowHeight }}>
              {range.months.map((m, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-[var(--mn-border,theme(colors.border))] opacity-40" style={{ left: days(range.min, m.date) * ppd }} />
              ))}
              {showToday && todayL >= 0 && todayL <= tlW && <TodayMarker left={todayL} />}
              {allDeps.length > 0 && <DepArrows deps={allDeps} pos={pos} />}
              {flat.map((t, i) => {
                const isChild = tasks.every((p) => p.id !== t.id)
                const x = days(range.min, parseD(t.start)) * ppd
                const w = days(parseD(t.start), parseD(t.end)) * ppd
                return (
                  <div key={t.id} className={cn("relative border-b border-[var(--mn-border,theme(colors.border))]", i % 2 === 1 && "bg-[var(--mn-surface-raised,theme(colors.muted))]/30")} style={{ height: rowHeight }}>
                    <TaskBar task={t} left={x} width={w} rowH={rowHeight} isChild={isChild} />
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
