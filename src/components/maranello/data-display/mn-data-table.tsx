"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  type StatusBadgeMeta, STATUS_MAP,
  type MetricValue, type PersonValue, type ProgressValue,
  type ActionDef, type ActionValue, type LinkValue,
  toInitials, clampPct,
  type CellType, type DataTableColumn, type SortDir, type SelectionMode,
  compare, processRows, groupRows,
  tableWrap, thBase, tdBase, rowBase, alignCls, widthStyle,
} from "./mn-data-table.helpers"

export type { DataTableColumn } from "./mn-data-table.helpers"
export type { CellType, MetricValue, PersonValue, ProgressValue, ActionValue, ActionDef, LinkValue } from "./mn-data-table.helpers"

/* ── Built-in V2 Cell Renderers ──────────────────────────── */

function StatusBadgeCell({ value }: { value: unknown }) {
  const meta = STATUS_MAP[String(value ?? "").toLowerCase()] ?? STATUS_MAP.info
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold leading-tight", meta.cls)}><span aria-hidden="true">{meta.symbol}</span>{String(value ?? "")}</span>
}

function ProgressBarCell({ value }: { value: unknown }) {
  const p = (typeof value === "object" && value !== null ? value : { value: Number(value) || 0, max: 100 }) as ProgressValue
  const pct = clampPct(p.value, p.max ?? 100)
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--mn-surface-sunken,var(--mn-border))]">
        <div className="h-full rounded-full bg-[var(--mn-accent)] transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-[0.65rem] tabular-nums text-[var(--mn-text-muted)]">{p.label ?? `${Math.round(pct)}%`}</span>
    </div>
  )
}

function SparklineCell({ value }: { value: unknown }) {
  const data = Array.isArray(value) ? (value as number[]).filter(v => typeof v === 'number' && !Number.isNaN(v)) : []
  if (data.length < 2) return <span className="text-[var(--mn-text-muted)]">{"\u2014"}</span>
  const lo = Math.min(...data), hi = Math.max(...data), range = hi - lo || 1, h = 20, w = 60
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - lo) / range) * h}`).join(" ")
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block align-middle" aria-hidden="true"><polyline points={pts} fill="none" stroke="var(--mn-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function AvatarCell({ value }: { value: unknown }) {
  const p = (typeof value === "object" && value !== null ? value : { name: String(value ?? "") }) as PersonValue
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mn-primary-bg,var(--mn-surface-raised))] text-[0.6rem] font-bold text-[var(--mn-primary,var(--mn-accent))]">
        {p.avatar ? <img src={p.avatar} alt={p.name} className="h-full w-full rounded-full object-cover" /> : toInitials(p.name)}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm text-[var(--mn-text)]">{p.name}</span>
        {p.email && <span className="text-[0.65rem] text-[var(--mn-text-muted)]">{p.email}</span>}
      </span>
    </div>
  )
}

function ActionButtonsCell({ value, row, onAction }: { value: unknown; row: Record<string, unknown>; onAction?: (id: string, row: Record<string, unknown>) => void }) {
  const actions = ((value as ActionValue)?.actions ?? []) as ActionDef[]
  if (!actions.length) return <span className="text-[var(--mn-text-muted)]">{"\u2014"}</span>
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {actions.map((a) => <button key={a.id} type="button" aria-label={a.label} className="rounded px-2 py-0.5 text-[0.7rem] font-medium text-[var(--mn-accent)] transition-colors hover:bg-[var(--mn-primary-bg,var(--mn-surface-raised))]" onClick={() => onAction?.(a.id, row)}>{a.label}</button>)}
    </div>
  )
}

function LinkCell({ value }: { value: unknown }) {
  const l = (typeof value === "object" && value !== null ? value : { text: String(value ?? ""), href: "#" }) as LinkValue
  const ext = l.external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}
  return <a href={l.href} className="text-[var(--mn-accent)] underline-offset-2 hover:underline" {...ext}>{l.text}{l.external && <span className="ml-0.5 text-[0.6rem]" aria-hidden="true">{"\u2197"}</span>}</a>
}

export interface MnDataTableProps<T extends Record<string, unknown>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  columns: DataTableColumn<T>[]; data: T[]; pageSize?: number
  groupBy?: string; selectable?: SelectionMode; compact?: boolean
  loading?: boolean; emptyMessage?: string
  onRowClick?: (row: T, index: number) => void
  onSort?: (key: string, direction: SortDir) => void
  onFilter?: (filters: Record<string, string>) => void
  onSelectionChange?: (selected: T[]) => void
  onAction?: (actionId: string, row: T) => void
}

function renderV2Cell<T extends Record<string, unknown>>(col: DataTableColumn<T>, value: unknown, row: T, onAction?: (id: string, row: T) => void): React.ReactNode {
  switch (col.type) {
    case "status": return <StatusBadgeCell value={value} />
    case "progress": return <ProgressBarCell value={value} />
    case "sparkline": return <SparklineCell value={value} />
    case "avatar": return <AvatarCell value={value} />
    case "action": return <ActionButtonsCell value={value} row={row} onAction={onAction as ((id: string, row: Record<string, unknown>) => void) | undefined} />
    case "link": return <LinkCell value={value} />
    default: return undefined
  }
}

/* ── Component ───────────────────────────────────────────── */

function MnDataTable<T extends Record<string, unknown>>({
  columns, data, pageSize = 0, groupBy, selectable, compact = false, loading = false,
  emptyMessage = "No data found", onRowClick, onSort, onFilter, onSelectionChange, onAction, className, ...rest
}: MnDataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState(1)
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [page, setPage] = React.useState(0)
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())

  const sorted = React.useMemo(() => processRows(data, filters, sortKey, sortDir), [data, filters, sortKey, sortDir])
  const totalPages = pageSize > 0 ? Math.ceil(sorted.length / pageSize) : 1
  const colSpan = columns.length + (selectable ? 1 : 0)
  const hasFilters = columns.some((c) => c.filterable)

  React.useEffect(() => { setPage(0) }, [filters, data])

  const doSort = (key: string) => {
    const nd = sortKey === key ? (sortDir === 1 ? -1 : 1) : 1
    setSortKey(key); setSortDir(nd); onSort?.(key, nd === 1 ? "asc" : "desc")
  }
  const doFilter = (key: string, v: string) => setFilters((p) => {
    const n = { ...p }
    if (v) { n[key] = v } else { delete n[key] }
    onFilter?.(n)
    return n
  })
  const notify = React.useCallback((s: Set<number>) => onSelectionChange?.(Array.from(s).map((i) => data[i]).filter(Boolean)), [data, onSelectionChange])
  const toggleSelect = React.useCallback((idx: number) => setSelected((prev) => {
    if (selectable === "single") { const n = prev.has(idx) ? new Set<number>() : new Set([idx]); notify(n); return n }
    const n = new Set(prev); if (n.has(idx)) { n.delete(idx) } else { n.add(idx) }; notify(n); return n
  }), [selectable, notify])
  const toggleAll = React.useCallback(() => {
    if (selectable !== "multi") return
    setSelected((p) => { const n = p.size === data.length ? new Set<number>() : new Set(data.map((_, i) => i)); notify(n); return n })
  }, [selectable, data, notify])
  const onActivate = (e: React.KeyboardEvent, fn: () => void) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn() } }
  const toggleGroup = (name: string) => setCollapsed((p) => { const n = new Set(p); if (n.has(name)) { n.delete(name) } else { n.add(name) }; return n })

  function renderRow(row: T, ri: number) {
    const isSel = selected.has(ri)
    const act = () => { if (selectable) toggleSelect(ri); onRowClick?.(row, ri) }
    return (
      <tr key={ri} role="row" aria-selected={selectable ? isSel : undefined}
        tabIndex={selectable || onRowClick ? 0 : undefined}
        className={cn(rowBase, isSel && "bg-[var(--mn-primary-bg)]")}
        onClick={act} onKeyDown={(e) => onActivate(e, act)}>
        {selectable && (
          <td role="gridcell" className="w-10 px-2 text-center">
            <input type="checkbox" checked={isSel} aria-label={`Select row ${ri + 1}`}
              onChange={() => toggleSelect(ri)} onClick={(e) => e.stopPropagation()} />
          </td>
        )}
        {columns.map((col) => {
          const raw = row[col.key]
          const v2 = col.type ? renderV2Cell(col, raw, row, onAction) : undefined
          return (
            <td key={col.key} role="gridcell" className={cn(tdBase, alignCls(col.align))} style={widthStyle(col.width)}>
              {v2 ?? (col.render ? col.render(raw, row) : String(raw ?? ""))}
            </td>
          )
        })}
      </tr>
    )
  }

  function renderBody() {
    if (loading) return <tr><td colSpan={colSpan} className="py-8 text-center text-[var(--mn-text-muted)]">Loading...</td></tr>
    if (sorted.length === 0) return <tr><td colSpan={colSpan} className="py-8 text-center text-[var(--mn-text-muted)]">{emptyMessage}</td></tr>
    if (groupBy) return groupRows(sorted, groupBy).flatMap((g) => {
      const hide = collapsed.has(g.name)
      return [
        <tr key={`g-${g.name}`} role="row" tabIndex={0} aria-expanded={!hide}
          className="cursor-pointer bg-[var(--mn-surface-raised)] font-medium"
          onClick={() => toggleGroup(g.name)} onKeyDown={(e) => onActivate(e, () => toggleGroup(g.name))}>
          <td colSpan={colSpan} className="px-3 py-2">
            <span className={cn("mr-1 inline-block transition-transform", !hide && "rotate-90")}>{"\u25B8"}</span>
            {g.name} <span className="ml-1 text-[var(--mn-text-muted)]">({g.rows.length})</span>
          </td>
        </tr>,
        ...(hide ? [] : g.rows.map((r) => renderRow(r, data.indexOf(r)))),
      ]
    })
    const start = pageSize > 0 ? page * pageSize : 0
    const slice = pageSize > 0 ? sorted.slice(start, start + pageSize) : sorted
    return slice.map((r, vi) => renderRow(r, pageSize > 0 ? start + vi : vi))
  }

  const ariaSortFor = (c: DataTableColumn<T>) => !c.sortable ? undefined : sortKey !== c.key ? "none" as const : sortDir === 1 ? "ascending" as const : "descending" as const

  return (
    <div className={cn(tableWrap({ compact }), className)} {...rest}>
      <table role="grid" aria-label={rest["aria-label"] ?? "Data table"} className="w-full border-collapse text-sm">
        <thead>
          <tr role="row">
            {selectable && <th role="columnheader" className="w-10 px-2 py-2 text-center">
              {selectable === "multi" && <input type="checkbox" aria-label="Select all rows" checked={data.length > 0 && selected.size === data.length} onChange={toggleAll} />}
            </th>}
            {columns.map((col) => (
              <th key={col.key} role="columnheader" scope="col" aria-sort={ariaSortFor(col)}
                tabIndex={col.sortable ? 0 : undefined} style={widthStyle(col.width)}
                className={cn(thBase, col.sortable && "cursor-pointer select-none hover:text-[var(--mn-text)]", alignCls(col.align))}
                onClick={col.sortable ? () => doSort(col.key) : undefined}
                onKeyDown={col.sortable ? (e) => onActivate(e, () => doSort(col.key)) : undefined}>
                {col.label ?? col.key}
                {col.sortable && <span className="ml-1 inline-block" aria-hidden="true">{sortKey === col.key ? (sortDir === 1 ? "\u25B2" : "\u25BC") : "\u21C5"}</span>}
              </th>
            ))}
          </tr>
          {hasFilters && <tr role="row">
            {selectable && <th />}
            {columns.map((col) => (
              <th key={`f-${col.key}`} className="px-3 pb-2">
                {col.filterable && <input type="text" placeholder="Filter..." aria-label={`Filter ${col.label ?? col.key}`}
                  className="w-full rounded border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2 py-1 text-xs text-[var(--mn-text)]"
                  onChange={(e) => doFilter(col.key, e.target.value)} />}
              </th>
            ))}
          </tr>}
        </thead>
        <tbody role="rowgroup">{renderBody()}</tbody>
      </table>
      {pageSize > 0 && totalPages > 1 && (
        <nav aria-label="Table pagination" className="flex items-center justify-center gap-1 border-t border-[var(--mn-border)] px-3 py-2">
          <button disabled={page === 0} aria-label="Previous page" className="rounded px-2 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => p - 1)}>{"\u2190"}</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} aria-label={`Page ${i + 1}`} aria-current={i === page ? "page" : undefined} disabled={i === page}
              className={cn("rounded px-2 py-1 text-sm", i === page ? "bg-[var(--mn-primary)] text-[var(--mn-on-primary)] font-semibold" : "hover:bg-[var(--mn-surface-raised)]")}
              onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button disabled={page >= totalPages - 1} aria-label="Next page" className="rounded px-2 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => p + 1)}>{"\u2192"}</button>
        </nav>
      )}
      <div role="status" aria-live="polite" className="sr-only">
        {sorted.length} of {data.length} rows{pageSize > 0 ? `, page ${page + 1} of ${totalPages}` : ""}
      </div>
    </div>
  )
}

export { MnDataTable, StatusBadgeCell, ProgressBarCell, SparklineCell, AvatarCell, ActionButtonsCell, LinkCell }
