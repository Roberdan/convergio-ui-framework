"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from "recharts"

export interface ChartSeries { label?: string; data: number[]; color?: string }
export interface DonutSegment { value: number; label?: string; color?: string }
export interface BubblePoint { x: number; y: number; z?: number; label?: string; color?: string }
export interface RadarPoint { label: string; value: number }
export type ChartType = "sparkline" | "donut" | "area" | "bar" | "radar" | "bubble"

export interface MnChartProps extends React.HTMLAttributes<HTMLDivElement> {
  type: ChartType
  series?: ChartSeries[]
  segments?: DonutSegment[]
  points?: BubblePoint[]
  radarData?: RadarPoint[]
  labels?: string[]
  showLegend?: boolean
  animate?: boolean
}

const PALETTE = [
  "var(--mn-accent)", "var(--mn-info)", "var(--mn-warning)",
  "var(--mn-success)", "var(--mn-error)", "var(--mn-text-muted)",
]

function pal(i: number, custom?: string) { return custom ?? PALETTE[i % PALETTE.length] }

const AXIS = { fontSize: 11, fill: "var(--mn-text-muted)" }
const GRID = { stroke: "var(--mn-border)", strokeDasharray: "3 3" }

function MnTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !Array.isArray(payload) || !payload.length) return null
  return (
    <div className="rounded-md border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] px-3 py-2 text-xs shadow-lg">
      {label != null && <p className="mb-1 text-[var(--mn-text-muted)]">{String(label)}</p>}
      {payload.map((entry: Record<string, unknown>, i: number) => (
        <p key={i} className="flex items-center gap-2 text-[var(--mn-text)]">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: String(entry.color ?? "") }} />
          {String(entry.name)}: <span className="font-medium">{String(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}

function toXYData(series: ChartSeries[], labels: string[]) {
  const maxLen = Math.max(...series.map(s => s.data.length), 0)
  return Array.from({ length: maxLen }, (_, i) => {
    const row: Record<string, string | number> = { name: labels[i] ?? `#${i}` }
    series.forEach((s, si) => { row[s.label ?? `Series ${si + 1}`] = s.data[i] ?? 0 })
    return row
  })
}

export function MnChart({
  type, series = [], segments = [], points = [], radarData = [],
  labels = [], showLegend = false, animate = true, className, ...props
}: MnChartProps) {
  const anim = animate
    ? { isAnimationActive: true, animationDuration: 600, animationEasing: "ease-out" as const }
    : { isAnimationActive: false }

  const legendStyle = { fontSize: 12, color: "var(--mn-text-muted)" }

  function renderChart() {
    if (type === "area") {
      const data = toXYData(series, labels)
      return (
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip content={<MnTooltip />} />
          {showLegend && <Legend wrapperStyle={legendStyle} />}
          {series.map((s, i) => {
            const key = s.label ?? `Series ${i + 1}`
            const c = pal(i, s.color)
            return <Area key={key} type="monotone" dataKey={key} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.15} {...anim} />
          })}
        </AreaChart>
      )
    }

    if (type === "bar") {
      const data = toXYData(series, labels)
      return (
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip content={<MnTooltip />} cursor={{ fill: "var(--mn-surface-hover)" }} />
          {showLegend && <Legend wrapperStyle={legendStyle} />}
          {series.map((s, i) => {
            const key = s.label ?? `Series ${i + 1}`
            return <Bar key={key} dataKey={key} fill={pal(i, s.color)} radius={[4, 4, 0, 0]} {...anim} />
          })}
        </BarChart>
      )
    }

    if (type === "sparkline") {
      const data = toXYData(series, labels)
      return (
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Tooltip content={<MnTooltip />} />
          {series.map((s, i) => {
            const key = s.label ?? `Series ${i + 1}`
            return <Line key={key} type="monotone" dataKey={key} stroke={pal(i, s.color)} strokeWidth={2} dot={false} {...anim} />
          })}
        </LineChart>
      )
    }

    if (type === "donut") {
      const data = segments.map(s => ({ name: s.label ?? "Segment", value: s.value }))
      return (
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius="55%" outerRadius="80%" paddingAngle={3} strokeWidth={0} {...anim}>
            {segments.map((s, i) => <Cell key={i} fill={pal(i, s.color)} />)}
          </Pie>
          <Tooltip content={<MnTooltip />} />
          {showLegend && <Legend wrapperStyle={legendStyle} />}
        </PieChart>
      )
    }

    if (type === "radar") {
      const data = radarData.map(d => ({ subject: d.label, value: d.value }))
      return (
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--mn-border)" />
          <PolarAngleAxis dataKey="subject" tick={AXIS} />
          <Radar name="Value" dataKey="value" stroke="var(--mn-accent)"
            fill="var(--mn-accent)" fillOpacity={0.2} strokeWidth={2} {...anim} />
          <Tooltip content={<MnTooltip />} />
        </RadarChart>
      )
    }

    if (type === "bubble") {
      return (
        <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="x" type="number" tick={AXIS} axisLine={false} tickLine={false} name="X" />
          <YAxis dataKey="y" type="number" tick={AXIS} axisLine={false} tickLine={false} name="Y" />
          <ZAxis dataKey="z" type="number" range={[60, 400]} name="Size" />
          <Tooltip content={<MnTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          {showLegend && <Legend wrapperStyle={legendStyle} />}
          {points.map((p, i) => (
            <Scatter key={i} name={p.label ?? `Point ${i + 1}`}
              data={[{ x: p.x, y: p.y, z: p.z ?? 1 }]}
              fill={pal(i, p.color)} fillOpacity={0.6} {...anim} />
          ))}
        </ScatterChart>
      )
    }

    return null
  }

  return (
    <div className={cn("relative h-48 w-full", className)} role="img" aria-label={`${type} chart`} {...props}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        {renderChart()!}
      </ResponsiveContainer>
    </div>
  )
}
