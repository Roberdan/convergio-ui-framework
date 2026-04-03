"use client"

import { useEffect, useMemo, useState } from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { formatNumber } from "../shared/mn-format"
import { ArrowDown, ArrowUp, ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react"

export interface AgentCostRow {
  id: string; agentName: string; model: string; totalTokens: number
  cachedTokens?: number; cost: number; costDelta?: number; calls: number
  avgLatencyMs?: number; budget?: number; tags?: string[]
}

export interface MnAgentCostBreakdownProps {
  rows: AgentCostRow[]; currency?: string; period?: string; sortable?: boolean
  onSelect?: (row: AgentCostRow) => void; onBudgetAlert?: (row: AgentCostRow) => void
  className?: string
}

type SortDir = "asc" | "desc"
const COMPACT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

function currencyFmt(c: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 })
}

function cachedPct(r: AgentCostRow): number {
  return r.cachedTokens && r.totalTokens ? (r.cachedTokens / r.totalTokens) * 100 : 0
}

function sortVal(r: AgentCostRow, key: string): number | string {
  if (key === "cachedPct") return cachedPct(r)
  if (key === "tags") return (r.tags ?? []).join(",")
  const v = r[key as keyof AgentCostRow]
  if (typeof v === "string") return v
  if (typeof v === "number") return v
  return 0
}

function sortRows(rows: AgentCostRow[], key: string, dir: SortDir): AgentCostRow[] {
  return [...rows].sort((a, b) => {
    const va = sortVal(a, key), vb = sortVal(b, key)
    const cmp = typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number)
    return dir === "asc" ? cmp : -cmp
  })
}

function modelVariant(model: string) {
  const m = model.toLowerCase()
  if (m.includes("sonnet")) return "sonnet" as const
  if (m.includes("haiku")) return "haiku" as const
  if (m.includes("opus")) return "opus" as const
  return "other" as const
}

function cachedLevel(pct: number) {
  if (pct > 30) return "high" as const
  return pct >= 10 ? ("mid" as const) : ("low" as const)
}

const wrapCva = cva("w-full overflow-auto rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)]")
const modelBadgeCva = cva("inline-block rounded px-1.5 py-0.5 text-xs font-medium", {
  variants: { variant: {
    sonnet: "bg-[var(--mn-info-bg)] text-[var(--mn-info)]",
    haiku: "bg-[var(--mn-success-bg)] text-[var(--mn-success)]",
    opus: "bg-[var(--mn-warning-bg)] text-[var(--mn-warning)]",
    other: "bg-[var(--mn-surface-raised)] text-[var(--mn-text-muted)]",
  } }, defaultVariants: { variant: "other" },
})
const cachedCva = cva("tabular-nums", {
  variants: { level: {
    high: "text-[var(--mn-success)]", mid: "text-[var(--mn-warning)]", low: "text-[var(--mn-error)]",
  } },
})

const TH = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--mn-text-muted)]"
const TD = "px-3 py-2 text-sm text-[var(--mn-text)]"
const ROW = "border-b border-[var(--mn-border)] transition-colors hover:bg-[var(--mn-surface-raised)]"
const COLS = [
  { key: "agentName", label: "Agent", num: false, hide: false },
  { key: "model", label: "Model", num: false, hide: false },
  { key: "totalTokens", label: "Tokens", num: true, hide: false },
  { key: "cachedPct", label: "Cached %", num: true, hide: false },
  { key: "cost", label: "Cost", num: true, hide: false },
  { key: "costDelta", label: "Delta", num: true, hide: false },
  { key: "calls", label: "Calls", num: true, hide: false },
  { key: "avgLatencyMs", label: "Latency", num: true, hide: true },
  { key: "budget", label: "Budget", num: false, hide: false },
  { key: "tags", label: "Tags", num: false, hide: true },
] as const

function Dash() { return <span className="text-[var(--mn-text-muted)]">&mdash;</span> }

function DeltaCell({ value }: { value?: number }) {
  if (value == null) return <Dash />
  const up = value > 0
  return (
    <span className={cn("inline-flex items-center gap-0.5", up ? "text-[var(--mn-error)]" : "text-[var(--mn-success)]")}>
      {up ? <TrendingUp className="size-3" aria-hidden /> : <TrendingDown className="size-3" aria-hidden />}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function BudgetCell({ row }: { row: AgentCostRow }) {
  if (row.budget == null) return <Dash />
  const pct = Math.min((row.cost / row.budget) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs tabular-nums">{COMPACT.format(row.budget)}</span>
      <div className="h-1.5 w-16 rounded-full bg-[var(--mn-surface-sunken)]">
        <div className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-[var(--mn-error)]" : "bg-[var(--mn-primary)]")}
          style={{ width: `${pct.toFixed(1)}%` }} role="progressbar"
          aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
          aria-label={`Budget usage ${pct.toFixed(0)}%`} />
      </div>
    </div>
  )
}

function TagsCell({ tags }: { tags?: string[] }) {
  if (!tags?.length) return <Dash />
  return (
    <div className="flex gap-1">
      {tags.slice(0, 2).map((t) => (
        <span key={t} className="inline-block rounded bg-[var(--mn-surface-raised)] px-1.5 py-0.5 text-xs text-[var(--mn-text-muted)]">{t}</span>
      ))}
    </div>
  )
}

export function MnAgentCostBreakdown({
  rows, currency = "USD", period = "This period", sortable = true,
  onSelect, onBudgetAlert, className,
}: MnAgentCostBreakdownProps) {
  const [sortKey, setSortKey] = useState("cost")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const fmt = useMemo(() => currencyFmt(currency), [currency])
  const data = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir])
  const totals = useMemo(() => ({
    tokens: rows.reduce((s, r) => s + r.totalTokens, 0),
    cost: rows.reduce((s, r) => s + r.cost, 0),
    calls: rows.reduce((s, r) => s + r.calls, 0),
  }), [rows])

  useEffect(() => {
    if (!onBudgetAlert) return
    for (const r of rows) {
      if (r.budget != null && r.cost > r.budget * 0.8) onBudgetAlert(r)
    }
  }, [rows, onBudgetAlert])

  function doSort(key: string) {
    if (!sortable) return
    setSortDir((d) => (sortKey === key && d === "asc" ? "desc" : "asc"))
    setSortKey(key)
  }

  function activate(e: React.KeyboardEvent, fn: () => void) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn() }
  }

  function sortIcon(key: string) {
    if (!sortable) return null
    const cls = "ml-1 inline size-3"
    if (sortKey !== key) return <ArrowUpDown className={cn(cls, "opacity-40")} aria-hidden />
    return sortDir === "asc" ? <ArrowUp className={cls} aria-hidden /> : <ArrowDown className={cls} aria-hidden />
  }

  return (
    <div className={cn(wrapCva(), className)}>
      <div className="flex items-center justify-between border-b border-[var(--mn-border)] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--mn-text)]">Agent Cost Breakdown</h3>
          <span className="text-xs text-[var(--mn-text-muted)]">{period}</span>
        </div>
        <span className="text-lg font-bold tabular-nums text-[var(--mn-text)]">{fmt.format(totals.cost)}</span>
      </div>
      <table role="grid" aria-label="Agent cost breakdown" className="w-full border-collapse text-sm">
        <thead>
          <tr role="row">
            {COLS.map((c) => (
              <th key={c.key} role="columnheader" scope="col"
                aria-sort={sortable && sortKey === c.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                tabIndex={sortable ? 0 : undefined}
                className={cn(TH, sortable && "cursor-pointer select-none hover:text-[var(--mn-text)]", c.num && "text-right", c.hide && "hidden md:table-cell")}
                onClick={sortable ? () => doSort(c.key) : undefined}
                onKeyDown={sortable ? (e) => activate(e, () => doSort(c.key)) : undefined}>
                {c.label}{sortIcon(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {data.map((row) => {
            const cp = cachedPct(row)
            return (
              <tr key={row.id} role="row" tabIndex={onSelect ? 0 : undefined}
                className={cn(ROW, onSelect && "cursor-pointer")}
                onClick={onSelect ? () => onSelect(row) : undefined}
                onKeyDown={onSelect ? (e) => activate(e, () => onSelect(row)) : undefined}>
                <td className={TD}><strong>{row.agentName}</strong></td>
                <td className={TD}><span className={modelBadgeCva({ variant: modelVariant(row.model) })}>{row.model}</span></td>
                <td className={cn(TD, "text-right tabular-nums")}>{COMPACT.format(row.totalTokens)}</td>
                <td className={cn(TD, "text-right")}><span className={cachedCva({ level: cachedLevel(cp) })}>{cp.toFixed(0)}%</span></td>
                <td className={cn(TD, "text-right tabular-nums")}><strong>{fmt.format(row.cost)}</strong></td>
                <td className={cn(TD, "text-right")}><DeltaCell value={row.costDelta} /></td>
                <td className={cn(TD, "text-right tabular-nums")}>{formatNumber(row.calls)}</td>
                <td className={cn(TD, "text-right tabular-nums hidden md:table-cell")}>
                  {row.avgLatencyMs != null ? `${formatNumber(row.avgLatencyMs)}ms` : <Dash />}
                </td>
                <td className={TD}><BudgetCell row={row} /></td>
                <td className={cn(TD, "hidden md:table-cell")}><TagsCell tags={row.tags} /></td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--mn-border)] bg-[var(--mn-surface-raised)]">
            <td className={TD} colSpan={2}><strong>Total</strong></td>
            <td className={cn(TD, "text-right tabular-nums")}><strong>{COMPACT.format(totals.tokens)}</strong></td>
            <td className={TD} />
            <td className={cn(TD, "text-right tabular-nums")}><strong>{fmt.format(totals.cost)}</strong></td>
            <td className={TD} />
            <td className={cn(TD, "text-right tabular-nums")}><strong>{formatNumber(totals.calls)}</strong></td>
            <td className={cn(TD, "hidden md:table-cell")} colSpan={3} />
          </tr>
        </tfoot>
      </table>
      <div role="status" aria-live="polite" className="sr-only">
        {rows.length} agents, total cost {fmt.format(totals.cost)}
      </div>
    </div>
  )
}
