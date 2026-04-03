"use client"

import { useCallback, useMemo, useState } from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface NineBoxItem {
  id: string
  label: string
  performance: 0 | 1 | 2
  potential: 0 | 1 | 2
  subtitle?: string
  avatar?: string
}

export interface MnNineBoxMatrixProps {
  items: NineBoxItem[]
  xLabel?: string
  yLabel?: string
  xAxisLabels?: [string, string, string]
  yAxisLabels?: [string, string, string]
  onSelect?: (item: NineBoxItem) => void
  onMove?: (item: NineBoxItem, performance: 0 | 1 | 2, potential: 0 | 1 | 2) => void
  ariaLabel?: string
  className?: string
}

type Level = 0 | 1 | 2
type Tier = "invest" | "selective" | "divest"

function getTier(perf: Level, pot: Level): Tier {
  const s = perf + pot
  if (s >= 3) return "invest"
  if (s <= 1) return "divest"
  return "selective"
}

function clampLevel(v: number): Level {
  return Math.max(0, Math.min(2, v)) as Level
}

const cellVariants = cva(
  "relative flex flex-col items-start gap-1 rounded-md border p-2 min-h-20 transition-colors",
  {
    variants: {
      tier: {
        invest: "bg-[var(--mn-success-bg)] border-[color-mix(in_srgb,var(--mn-success)_24%,transparent)]",
        selective: "bg-[var(--mn-warning-bg)] border-[color-mix(in_srgb,var(--mn-warning)_24%,transparent)]",
        divest: "bg-muted/50 border-border",
      },
    },
    defaultVariants: { tier: "selective" },
  },
)

/* ── Component ─────────────────────────────────────────────── */

export function MnNineBoxMatrix({
  items, xLabel = "Performance", yLabel = "Potential",
  xAxisLabels = ["Low", "Medium", "High"],
  yAxisLabels = ["Low", "Medium", "High"],
  onSelect, onMove, ariaLabel, className,
}: MnNineBoxMatrixProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const itemsByCell = useMemo(() => {
    const map = new Map<string, NineBoxItem[]>()
    for (const item of items) {
      const key = `${item.performance},${item.potential}`
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return map
  }, [items])

  const handleItemClick = useCallback((item: NineBoxItem) => {
    const next = selectedId === item.id ? null : item.id
    setSelectedId(next)
    if (next) onSelect?.(item)
  }, [selectedId, onSelect])

  const handleCellClick = useCallback((perf: Level, pot: Level) => {
    if (!selectedId) return
    const item = items.find((i) => i.id === selectedId)
    if (!item || (item.performance === perf && item.potential === pot)) return
    onMove?.(item, perf, pot)
    setSelectedId(null)
  }, [selectedId, items, onMove])

  const handleItemKeyDown = useCallback((e: React.KeyboardEvent, item: NineBoxItem) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleItemClick(item); return }
    if (selectedId !== item.id) return
    let np = item.performance, nt = item.potential
    switch (e.key) {
      case "ArrowRight": np = clampLevel(np + 1); break
      case "ArrowLeft": np = clampLevel(np - 1); break
      case "ArrowUp": nt = clampLevel(nt + 1); break
      case "ArrowDown": nt = clampLevel(nt - 1); break
      default: return
    }
    e.preventDefault()
    if (np !== item.performance || nt !== item.potential) {
      onMove?.(item, np, nt)
      setSelectedId(null)
    }
  }, [selectedId, handleItemClick, onMove])

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, perf: Level, pot: Level) => {
    if ((e.key === "Enter" || e.key === " ") && selectedId) {
      e.preventDefault()
      handleCellClick(perf, pot)
    }
  }, [selectedId, handleCellClick])

  const gridLabel = ariaLabel ?? `${yLabel} vs ${xLabel} matrix`
  const rows: Level[] = [2, 1, 0]
  const cols: Level[] = [0, 1, 2]

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Y-axis label (rotated) */}
      <div className="flex items-center shrink-0" aria-hidden="true">
        <span className="text-xs font-medium text-muted-foreground [writing-mode:vertical-lr] rotate-180">{yLabel}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex gap-2">
          {/* Y-axis tick labels */}
          <div className="flex flex-col justify-around shrink-0 w-14 text-right" aria-hidden="true">
            {rows.map((pot) => (
              <span key={pot} className="text-xs text-muted-foreground">{yAxisLabels[pot]}</span>
            ))}
          </div>

          {/* 3×3 grid */}
          <div role="grid" aria-label={gridLabel} className="grid flex-1 grid-cols-3 gap-1">
            {rows.map((pot) => (
              <div key={pot} role="row" className="contents">
                {cols.map((perf) => {
                  const tier = getTier(perf, pot)
                  const cellItems = itemsByCell.get(`${perf},${pot}`) ?? []
                  return (
                    <div
                      key={`${perf},${pot}`}
                      role="gridcell"
                      tabIndex={0}
                      aria-label={`${yLabel}: ${yAxisLabels[pot]}, ${xLabel}: ${xAxisLabels[perf]}`}
                      className={cn(
                        cellVariants({ tier }),
                        selectedId && "cursor-pointer",
                      )}
                      onClick={() => handleCellClick(perf, pot)}
                      onKeyDown={(e) => handleCellKeyDown(e, perf, pot)}
                    >
                      {cellItems.map((item) => (
                        <button
                          key={item.id} type="button"
                          className={cn(
                            "flex w-full items-center gap-1.5 rounded border bg-card px-2 py-1 text-left text-xs transition-shadow",
                            "hover:ring-1 hover:ring-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                            selectedId === item.id && "ring-2 ring-primary shadow-sm",
                          )}
                          aria-pressed={selectedId === item.id} aria-label={item.label}
                          onClick={(e) => { e.stopPropagation(); handleItemClick(item) }}
                          onKeyDown={(e) => { e.stopPropagation(); handleItemKeyDown(e, item) }}
                        >
                          {item.avatar && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.avatar} alt="" className="size-5 rounded-full object-cover shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{item.label}</span>
                            {item.subtitle && (
                              <span className="block truncate text-muted-foreground text-[10px]">{item.subtitle}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* X-axis tick labels */}
        <div className="flex gap-2 mt-1" aria-hidden="true">
          <div className="w-14 shrink-0" />
          <div className="grid flex-1 grid-cols-3 gap-1">
            {xAxisLabels.map((label) => (
              <span key={label} className="text-center text-xs text-muted-foreground">{label}</span>
            ))}
          </div>
        </div>
        {/* X-axis label */}
        <div className="text-center mt-0.5" aria-hidden="true">
          <span className="text-xs font-medium text-muted-foreground">{xLabel}</span>
        </div>
      </div>
    </div>
  )
}
