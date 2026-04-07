# Maranello Composition Recipes v1.0

> Common page patterns using Maranello components. Copy these recipes as starting
> points — replace data shapes with your domain models.

---

## 1. OKR Dashboard

**Components**: `MnDashboardStrip` + `MnGauge` + `MnHbar` + `MnDataTable`

**When to use**: Executive dashboards showing KPIs, goal progress, and detailed breakdowns.

### Data shape

```ts
interface OkrDashboardData {
  metrics: { label: string; value: string; change?: string; trend?: "up" | "down" | "flat" }[];
  overallScore: number;          // 0–100 for the gauge
  categoryBars: { label: string; value: number; max: number }[];
  detailRows: { objective: string; keyResult: string; progress: number; owner: string; status: string }[];
}
```

### Code

```tsx
"use client"

import { MnDashboardStrip, MnGauge, MnHbar, MnDataTable, MnBadge } from "@/components/maranello"
import type { ColumnDef } from "@tanstack/react-table"

const COLUMNS: ColumnDef<DetailRow>[] = [
  { accessorKey: "objective", header: "Objective" },
  { accessorKey: "keyResult", header: "Key Result" },
  { accessorKey: "progress", header: "Progress",
    cell: ({ row }) => `${row.original.progress}%` },
  { accessorKey: "owner", header: "Owner" },
  { accessorKey: "status", header: "Status",
    cell: ({ row }) => <MnBadge tone={row.original.status === "on-track" ? "success" : row.original.status === "at-risk" ? "warning" : "danger"}>{row.original.status}</MnBadge> },
]

export function OkrDashboard({ data }: { data: OkrDashboardData }) {
  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <MnDashboardStrip metrics={data.metrics} />

      {/* Score gauge + category bars side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MnGauge value={data.overallScore} min={0} max={100} label="Overall OKR Score" />
        <MnHbar
          items={data.categoryBars.map(b => ({
            label: b.label, value: b.value, max: b.max,
          }))}
        />
      </div>

      {/* Detail table */}
      <MnDataTable columns={COLUMNS} data={data.detailRows} />
    </div>
  )
}
```

---

## 2. CRUD Page

**Components**: `MnDataTable` + `MnDetailPanel` + `MnStateScaffold` + `MnBadge`

**When to use**: Any entity list with create/read/update operations and a slide-out detail view.

### Data shape

```ts
interface CrudPageData<T> {
  items: T[];
  isLoading: boolean;
  error?: string;
  selectedItem: T | null;
}
```

### Code

```tsx
"use client"

import { useState } from "react"
import {
  MnDataTable, MnDetailPanel, MnStateScaffold, MnBadge,
} from "@/components/maranello"

export function CrudPage<T extends { id: string }>({
  items, columns, isLoading, error, renderDetail,
}: {
  items: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  error?: string;
  renderDetail: (item: T) => React.ReactNode;
}) {
  const [selected, setSelected] = useState<T | null>(null)

  // Loading / error / empty states — one component handles all three
  if (isLoading || error || items.length === 0) {
    return (
      <MnStateScaffold
        state={isLoading ? "loading" : error ? "error" : "empty"}
        message={error ?? "No items yet"}
      />
    )
  }

  return (
    <>
      <MnDataTable
        columns={columns}
        data={items}
        onRowClick={(row) => setSelected(row)}
      />

      <MnDetailPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Detail: ${selected.id}` : ""}
      >
        {selected && renderDetail(selected)}
      </MnDetailPanel>
    </>
  )
}
```

**Key insight**: Use `MnDetailPanel` for side detail views — NEVER use `Sheet`, `Dialog`, or custom sidebars. `MnStateScaffold` handles loading, error, and empty states in one component.

---

## 3. Analytics Page

**Components**: `MnChart` + `MnHbar` + `MnFilterPanel` + `MnDashboardStrip`

**When to use**: Data analysis pages with charts, filters, and summary metrics.

### Data shape

```ts
interface AnalyticsData {
  metrics: { label: string; value: string; change?: string }[];
  chartSeries: { label: string; data: number[] }[];
  chartLabels: string[];
  categoryBreakdown: { label: string; value: number; max: number }[];
  filters: { id: string; label: string; options: string[]; selected?: string }[];
}
```

### Code

```tsx
"use client"

import { useState } from "react"
import {
  MnDashboardStrip, MnChart, MnHbar, MnFilterPanel,
} from "@/components/maranello"

export function AnalyticsPage({ data }: { data: AnalyticsData }) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <MnFilterPanel
        filters={data.filters}
        values={activeFilters}
        onChange={setActiveFilters}
      />

      {/* Summary strip */}
      <MnDashboardStrip metrics={data.metrics} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MnChart
          type="area"
          labels={data.chartLabels}
          series={data.chartSeries}
        />
        <MnHbar
          items={data.categoryBreakdown.map(b => ({
            label: b.label, value: b.value, max: b.max,
          }))}
        />
      </div>
    </div>
  )
}
```

---

## 4. Gantt + Detail Panel

**Components**: `MnGantt` + `MnDataTable` + `MnDetailPanel` + `MnBadge` + `MnDashboardStrip`

**When to use**: Project planning views with timeline visualization and task detail.

### Data shape

```ts
import type { GanttTask } from "@/components/maranello"

interface GanttPageData {
  metrics: { label: string; value: string }[];
  tasks: GanttTask[];   // { id, title, start, end, status?, progress?, dependencies?, children? }
}
```

### Code

```tsx
"use client"

import { useState } from "react"
import {
  MnGantt, MnDataTable, MnDetailPanel, MnBadge, MnDashboardStrip, MnProgressRing,
} from "@/components/maranello"
import type { GanttTask } from "@/components/maranello"

const TASK_COLS = [
  { key: "title", label: "Task", sortable: true },
  { key: "start", label: "Start", sortable: true },
  { key: "end", label: "End", sortable: true },
  { key: "status", label: "Status" },
]

export function ProjectTimeline({ data }: { data: GanttPageData }) {
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null)

  return (
    <div className="space-y-6">
      <MnDashboardStrip metrics={data.metrics} />

      <MnGantt tasks={data.tasks} />

      <MnDataTable
        columns={TASK_COLS}
        data={data.tasks as unknown as Record<string, unknown>[]}
        onRowClick={(row) => setSelectedTask(row as unknown as GanttTask)}
      />

      <MnDetailPanel
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title ?? ""}
      >
        {selectedTask && (
          <div className="space-y-4">
            <MnBadge tone={selectedTask.status === "completed" ? "success" : selectedTask.status === "on-hold" ? "warning" : "info"}>
              {selectedTask.status ?? "planned"}
            </MnBadge>
            {selectedTask.progress != null && (
              <MnProgressRing value={selectedTask.progress} size="md" />
            )}
            <dl className="text-sm space-y-2 text-[var(--mn-text-muted)]">
              <div><dt className="font-medium">Start</dt><dd>{selectedTask.start}</dd></div>
              <div><dt className="font-medium">End</dt><dd>{selectedTask.end}</dd></div>
            </dl>
          </div>
        )}
      </MnDetailPanel>
    </div>
  )
}
```

---

## 5. Simulator Page

**Components**: `MnChart` + `MnGauge` + `MnHbar` + `MnDashboardStrip` + `MnSectionCard` + `MnFormField`

**When to use**: What-if scenario pages where users adjust inputs and see projected outcomes.

### Data shape

```ts
interface SimulatorData {
  inputs: { id: string; label: string; value: number; min: number; max: number; unit: string }[];
  projectedMetrics: { label: string; value: string; change?: string }[];
  projectedScore: number;
  scenarioSeries: { label: string; data: number[] }[];
  scenarioLabels: string[];
  impactBars: { label: string; value: number; max: number }[];
}
```

### Code

```tsx
"use client"

import { useState, useMemo } from "react"
import {
  MnDashboardStrip, MnChart, MnGauge, MnHbar,
  MnSectionCard, MnFormField,
} from "@/components/maranello"

export function SimulatorPage({ initialData }: { initialData: SimulatorData }) {
  const [inputs, setInputs] = useState(initialData.inputs)

  // Recalculate projections when inputs change
  const projected = useMemo(() => recalculate(inputs), [inputs])

  function handleInputChange(id: string, value: number) {
    setInputs(prev => prev.map(i => i.id === id ? { ...i, value } : i))
  }

  return (
    <div className="space-y-6">
      {/* Input controls */}
      <MnSectionCard title="Scenario Inputs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inputs.map(input => (
            <MnFormField key={input.id} label={`${input.label} (${input.unit})`}>
              <input
                type="range"
                min={input.min}
                max={input.max}
                value={input.value}
                onChange={(e) => handleInputChange(input.id, Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-[var(--mn-text-muted)]">{input.value} {input.unit}</span>
            </MnFormField>
          ))}
        </div>
      </MnSectionCard>

      {/* Projected outcomes */}
      <MnDashboardStrip metrics={projected.projectedMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MnGauge value={projected.projectedScore} min={0} max={100} label="Projected Score" />
        <MnChart
          type="line"
          labels={projected.scenarioLabels}
          series={projected.scenarioSeries}
          className="lg:col-span-2"
        />
      </div>

      {/* Impact breakdown */}
      <MnSectionCard title="Impact by Category">
        <MnHbar
          items={projected.impactBars.map(b => ({
            label: b.label, value: b.value, max: b.max,
          }))}
        />
      </MnSectionCard>
    </div>
  )
}
```

---

## Recipe Checklist

Before submitting a page, verify:

- [ ] All data displayed uses Maranello components (no custom `<table>`, `<div>` cards, etc.)
- [ ] All colors use `var(--mn-*)` tokens (no hex, no `text-red-500`, etc.)
- [ ] All icons are Lucide imports (no emoji)
- [ ] Loading/error/empty states use `MnStateScaffold`
- [ ] Detail views use `MnDetailPanel` (not Sheet or Dialog)
- [ ] Status indicators use `MnBadge` (not colored spans)
- [ ] File is under 250 lines (split to `.helpers.ts` if needed)
