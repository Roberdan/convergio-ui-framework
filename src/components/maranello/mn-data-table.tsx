"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ───────────────────────────────────────────────── */

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string; label?: string; sortable?: boolean; filterable?: boolean
  align?: "left" | "center" | "right"; width?: string | number
  render?: (value: unknown, row: T) => React.ReactNode
}

type SortDir = "asc" | "desc"
type SelectionMode = "single" | "multi"

export interface MnDataTableProps<T extends Record<string, unknown>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  columns: DataTableColumn<T>[]; data: T[]; pageSize?: number
  groupBy?: string; selectable?: SelectionMode; compact?: boolean
  loading?: boolean; emptyMessage?: string
  onRowClick?: (row: T, index: number) => void
  onSort?: (key: string, direction: SortDir) => void
  onFilter?: (filters: Record<string, string>) => void
  onSelectionChange?: (selected: T[]) => void
}

/* ── Helpers ──────────────────────────────────────────────── */

function compare(a: unknown, b: unknown, dir: number): number {
  if (a == null && b == null) return 0
  if (a == null) return dir; if (b == null) return -dir
  if (typeof a === "number" && typeof b === "number") return (a - b) * dir
  return String(a).localeCompare(String(b)) * dir
}

function processRows<T extends Record<string, unknown>>(rows: T[], filters: Record<string, string>, sortKey: string | null, sortDir: number): T[] {
  const keys = Object.keys(filters)
  let out = keys.length > 0
    ? rows.filter((r) => keys.every((k) => !filters[k] || String(r[k] ?? "").toLowerCase().includes(filters[k].toLowerCase())))
    : rows
  if (sortKey) out = [...out].sort((a, b) => compare(a[sortKey], b[sortKey], sortDir))
  return out
}

function groupRows<T extends Record<string, unknown>>(rows: T[], key: string): { name: string; rows: T[] }[] {
  const map = new Map<string, T[]>()
  for (const r of rows) { const k = String(r[key] ?? "Other"); if (!map.has(k)) map.set(k, []); map.get(k)!.push(r) }
  return Array.from(map, ([name, rows]) => ({ name, rows }))
}

const tableWrap = cva("w-full overflow-auto rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)]", {
  variants: { compact: { true: "[&_td]:py-1 [&_th]:py-1", false: "" } },
  defaultVariants: { compact: false },
})

const thBase = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--mn-text-muted)]"
const tdBase = "px-3 py-2 text-sm text-[var(--mn-text)]"
const rowBase = "border-b border-[var(--mn-border)] transition-colors hover:bg-[var(--mn-surface-raised)]"
const alignCls = (a?: string) => a === "right" ? "text-right" : a === "center" ? "text-center" : undefined
const widthStyle = (w?: string | number) => w ? { width: typeof w === "number" ? `${w}px` : w } : undefined

/* ── Component ───────────────────────────────────────────── */

function MnDataTable<T extends Record<string, unknown>>({
  columns, data, pageSize = 0, groupBy, selectable, compact = false, loading = false,
  emptyMessage = "No data found", onRowClick, onSort, onFilter, onSelectionChange, className, ...rest
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
    const n = { ...p }; v ? (n[key] = v) : delete n[key]; onFilter?.(n); return n
  })
  const notify = React.useCallback((s: Set<number>) => onSelectionChange?.(Array.from(s).map((i) => data[i]).filter(Boolean)), [data, onSelectionChange])
  const toggleSelect = React.useCallback((idx: number) => setSelected((prev) => {
    if (selectable === "single") { const n = prev.has(idx) ? new Set<number>() : new Set([idx]); notify(n); return n }
    const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); notify(n); return n
  }), [selectable, notify])
  const toggleAll = React.useCallback(() => {
    if (selectable !== "multi") return
    setSelected((p) => { const n = p.size === data.length ? new Set<number>() : new Set(data.map((_, i) => i)); notify(n); return n })
  }, [selectable, data, notify])
  const onActivate = (e: React.KeyboardEvent, fn: () => void) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn() } }
  const toggleGroup = (name: string) => setCollapsed((p) => { const n = new Set(p); n.has(name) ? n.delete(name) : n.add(name); return n })

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
        {columns.map((col) => (
          <td key={col.key} role="gridcell" className={cn(tdBase, alignCls(col.align))} style={widthStyle(col.width)}>
            {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
          </td>
        ))}
      </tr>
    )
  }

  function renderBody() {
    if (loading) return <tr><td colSpan={colSpan} className="py-8 text-center text-[var(--mn-text-muted)]">Loading…</td></tr>
    if (sorted.length === 0) return <tr><td colSpan={colSpan} className="py-8 text-center text-[var(--mn-text-muted)]">{emptyMessage}</td></tr>
    if (groupBy) return groupRows(sorted, groupBy).flatMap((g) => {
      const hide = collapsed.has(g.name)
      return [
        <tr key={`g-${g.name}`} role="row" tabIndex={0} aria-expanded={!hide}
          className="cursor-pointer bg-[var(--mn-surface-raised)] font-medium"
          onClick={() => toggleGroup(g.name)} onKeyDown={(e) => onActivate(e, () => toggleGroup(g.name))}>
          <td colSpan={colSpan} className="px-3 py-2">
            <span className={cn("mr-1 inline-block transition-transform", !hide && "rotate-90")}>▸</span>
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
                {col.sortable && <span className="ml-1 inline-block" aria-hidden="true">{sortKey === col.key ? (sortDir === 1 ? "▲" : "▼") : "⇅"}</span>}
              </th>
            ))}
          </tr>
          {hasFilters && <tr role="row">
            {selectable && <th />}
            {columns.map((col) => (
              <th key={`f-${col.key}`} className="px-3 pb-2">
                {col.filterable && <input type="text" placeholder="Filter…" aria-label={`Filter ${col.label ?? col.key}`}
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
          <button disabled={page === 0} aria-label="Previous page" className="rounded px-2 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => p - 1)}>←</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} aria-label={`Page ${i + 1}`} aria-current={i === page ? "page" : undefined} disabled={i === page}
              className={cn("rounded px-2 py-1 text-sm", i === page ? "bg-[var(--mn-primary)] text-[var(--mn-on-primary)] font-semibold" : "hover:bg-[var(--mn-surface-raised)]")}
              onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button disabled={page >= totalPages - 1} aria-label="Next page" className="rounded px-2 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => p + 1)}>→</button>
        </nav>
      )}
      <div role="status" aria-live="polite" className="sr-only">
        {sorted.length} of {data.length} rows{pageSize > 0 ? `, page ${page + 1} of ${totalPages}` : ""}
      </div>
    </div>
  )
}

export { MnDataTable }
