/* ── Types ─────────────────────────────────────────────────── */

export type GanttTaskStatus = "active" | "planned" | "completed" | "on-hold" | "withdrawn"
export interface GanttDependency { from: string; to: string }
export interface GanttTask {
  id: string; title: string; start: string; end: string
  status?: GanttTaskStatus; progress?: number; milestone?: boolean
  dependencies?: string[]; children?: GanttTask[]
}

/* ── Constants ─────────────────────────────────────────────── */

export const MS_DAY = 864e5
export const BAR_RADIUS = 3
export const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
export const STATUS_CFG: Record<string, { bar: string; grad: string }> = {
  active:    { bar: "var(--mn-success,#22c55e)", grad: "var(--mn-success,#22c55e)" },
  planned:   { bar: "var(--mn-warning,#f59e0b)", grad: "var(--mn-warning,#f59e0b)" },
  completed: { bar: "var(--mn-info,#3b82f6)", grad: "var(--mn-info,#3b82f6)" },
  "on-hold": { bar: "var(--mn-caution,#f97316)", grad: "var(--mn-caution,#f97316)" },
  withdrawn: { bar: "var(--mn-text-muted,#9ca3af)", grad: "var(--mn-text-muted,#9ca3af)" },
}

/* ── Zoom steps ────────────────────────────────────────────── */

export const ZOOM_MIN = 0.5, ZOOM_MAX = 4, ZOOM_STEP = 0.25

/* ── Helpers ───────────────────────────────────────────────── */

export function parseD(s: string) { return new Date(s) }
export function daysBetween(a: Date, b: Date) { return (b.getTime() - a.getTime()) / MS_DAY }
export function fmtS(d: Date) { return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}` }
export function addM(d: Date, n: number) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)) }
export function mStart(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)) }

export type FlatRow = { task: GanttTask; depth: number; isParent: boolean; summary?: { start: Date; end: Date } }

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

export function flattenVisible(tasks: GanttTask[], collapsed: Set<string>): FlatRow[] {
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

export function buildRange(tasks: GanttTask[]) {
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
  return { min, max, months, totalDays: daysBetween(min, max) }
}

export function buildDeps(tasks: GanttTask[]): GanttDependency[] {
  return flattenAll(tasks).flatMap((t) => (t.dependencies ?? []).map((from) => ({ from, to: t.id })))
}
