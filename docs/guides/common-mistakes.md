# Common Mistakes v1.0

> Real mistakes made during VirtualBPM Frontend v2 development. Each entry shows
> the wrong approach, why it is wrong, and the correct Maranello alternative.

---

## 1. Custom metric cards instead of MnDashboardStrip

### Wrong

```tsx
<div className="grid grid-cols-4 gap-4">
  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
    <span className="text-xs text-gray-400">Total Engagements</span>
    <span className="text-2xl font-bold text-white">55</span>
    <span className="text-xs text-green-400">+12%</span>
  </div>
  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
    <span className="text-xs text-gray-400">Active</span>
    <span className="text-2xl font-bold text-white">32</span>
  </div>
  {/* ...repeat for each KPI */}
</div>
```

**Problems**: Hardcoded colors (`gray-700`, `green-400`), breaks in non-dark themes, no trend indicators, no animation, inconsistent with other pages.

### Correct

```tsx
<MnDashboardStrip
  metrics={[
    { label: "Total Engagements", value: "55", trend: "up" },
    { label: "Active", value: "32" },
    { label: "Completed", value: "18", trend: "up" },
    { label: "At Risk", value: "5", trend: "down" },
  ]}
/>
```

---

## 2. HTML `<table>` instead of MnDataTable

### Wrong

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-700">
      <th className="text-left p-2">Name</th>
      <th className="text-left p-2">Status</th>
      <th className="text-left p-2">Owner</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-900">
        <td className="p-2">{item.name}</td>
        <td className="p-2">
          <span className="text-green-400">{item.status}</span>
        </td>
        <td className="p-2">{item.owner}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Problems**: No sorting, no filtering, no pagination, hardcoded colors, no column resize, no row selection, inconsistent styling.

### Correct

```tsx
const columns: ColumnDef<Item>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status",
    cell: ({ row }) => <MnBadge tone="success">{row.original.status}</MnBadge> },
  { accessorKey: "owner", header: "Owner" },
]

<MnDataTable columns={columns} data={data} />
```

---

## 3. Sheet/Dialog for detail views instead of MnDetailPanel

### Wrong

```tsx
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"

<Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
  <SheetContent className="w-[400px]">
    <SheetHeader>Detail</SheetHeader>
    <div className="space-y-4">
      {/* custom detail layout */}
    </div>
  </SheetContent>
</Sheet>
```

**Problems**: Sheet is a generic shadcn primitive. `MnDetailPanel` has built-in header, close button, scroll handling, theme integration, and consistent slide-out behavior across the app.

### Correct

```tsx
<MnDetailPanel
  open={!!selected}
  onClose={() => setSelected(null)}
  title={`Engagement: ${selected?.name}`}
>
  <div className="space-y-4">
    {/* detail content */}
  </div>
</MnDetailPanel>
```

---

## 4. Emoji in JSX

### Wrong

```tsx
<span>✅ Completed</span>
<span>⚠️ At Risk</span>
<span>🔴 Critical</span>
<h2>📊 Analytics</h2>
```

**Problems**: CONSTITUTION P2 violation. Emoji render inconsistently across OS/browsers, are not accessible, cannot be themed, and look unprofessional.

### Correct

```tsx
import { CheckCircle, AlertTriangle, XCircle, BarChart3 } from "lucide-react"

<span className="flex items-center gap-1.5">
  <CheckCircle className="size-4 text-[var(--mn-success)]" /> Completed
</span>
<span className="flex items-center gap-1.5">
  <AlertTriangle className="size-4 text-[var(--mn-warning)]" /> At Risk
</span>
<span className="flex items-center gap-1.5">
  <XCircle className="size-4 text-[var(--mn-error)]" /> Critical
</span>
<h2 className="flex items-center gap-2">
  <BarChart3 className="size-5" /> Analytics
</h2>
```

---

## 5. Hardcoded hex colors

### Wrong

```tsx
<div className="bg-[#1a1a2e] border-[#333] text-[#fafafa]">
  <span className="text-[#22c55e]">Active</span>
  <span className="text-[#ef4444]">Failed</span>
</div>
```

**Problems**: Breaks when user switches to light, colorblind, or navy theme. Colors are not semantic — no connection to the design system.

### Correct

```tsx
<div className="bg-[var(--mn-surface)] border-[var(--mn-border)] text-[var(--mn-text)]">
  <span className="text-[var(--mn-success)]">Active</span>
  <span className="text-[var(--mn-error)]">Failed</span>
</div>
```

---

## 6. Custom loading spinners instead of MnStateScaffold

### Wrong

```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
    </div>
  )
}

if (error) {
  return (
    <div className="text-center text-red-500 p-8">
      <p>Something went wrong</p>
      <button onClick={retry}>Retry</button>
    </div>
  )
}

if (data.length === 0) {
  return (
    <div className="text-center text-gray-400 p-8">
      <p>No data found</p>
    </div>
  )
}
```

**Problems**: Three separate custom components for three states. Hardcoded colors. No illustration. Inconsistent across pages.

### Correct

```tsx
if (isLoading || error || data.length === 0) {
  return (
    <MnStateScaffold
      state={isLoading ? "loading" : error ? "error" : "empty"}
      message={error?.message ?? "No data found"}
      onRetry={error ? retry : undefined}
    />
  )
}
```

---

## 7. Custom colored spans for status instead of MnBadge

### Wrong

```tsx
<span className={`px-2 py-0.5 rounded text-xs ${
  status === "active" ? "bg-green-900 text-green-300" :
  status === "paused" ? "bg-yellow-900 text-yellow-300" :
  "bg-red-900 text-red-300"
}`}>
  {status}
</span>
```

**Problems**: Tailwind color classes are not theme-aware. Logic duplication across pages. No accessible role.

### Correct

```tsx
<MnBadge tone={status === "active" ? "success" : status === "paused" ? "warning" : "danger"}>
  {status}
</MnBadge>
```

---

## 8. Custom div bars instead of MnHbar

### Wrong

```tsx
{categories.map(cat => (
  <div key={cat.label} className="flex items-center gap-2">
    <span className="w-24 text-xs text-gray-400">{cat.label}</span>
    <div className="flex-1 h-4 bg-gray-800 rounded">
      <div
        className="h-full bg-blue-500 rounded"
        style={{ width: `${(cat.value / cat.max) * 100}%` }}
      />
    </div>
    <span className="text-xs text-gray-300">{cat.value}</span>
  </div>
))}
```

**Problems**: No tooltips, no animation, hardcoded colors, no theme support, no labels, no accessibility.

### Correct

```tsx
<MnHbar
  items={categories.map(cat => ({
    label: cat.label,
    value: cat.value,
    max: cat.max,
  }))}
/>
```

---

## 9. Custom bordered divs instead of MnSectionCard

### Wrong

```tsx
<div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-white">Section Title</h3>
    <button className="text-sm text-blue-400">View All</button>
  </div>
  <div>{/* content */}</div>
</div>
```

**Problems**: Every developer creates a slightly different card. Hardcoded colors. No collapsible behavior. No consistent action slot.

### Correct

```tsx
<MnSectionCard
  title="Section Title"
  action={{ label: "View All", onClick: handleViewAll }}
  collapsible
>
  {/* content */}
</MnSectionCard>
```

---

## 10. Using recharts directly instead of MnChart

### Wrong

```tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={chartData}>
    <XAxis dataKey="month" stroke="#888" />
    <YAxis stroke="#888" />
    <Tooltip />
    <Area type="monotone" dataKey="value" stroke="#FFC72C" fill="#FFC72C33" />
  </AreaChart>
</ResponsiveContainer>
```

**Problems**: No theme integration. Hardcoded stroke/fill colors. No consistent tooltip styling. Missing accessibility.

### Correct

```tsx
<MnChart
  type="area"
  labels={chartData.map(d => d.month)}
  series={[{ label: "Value", data: chartData.map(d => d.value) }]}
/>
```

`MnChart` wraps recharts with theme-aware colors, consistent tooltips, and proper accessibility attributes.

---

## Quick Reference: Component Substitutions

| Wrong Approach | Correct Component |
|---------------|------------------|
| Custom `<div>` KPI cards | `MnDashboardStrip` |
| HTML `<table>` | `MnDataTable` |
| shadcn `Sheet` for details | `MnDetailPanel` |
| Emoji in JSX | Lucide icons |
| Hex color literals | `var(--mn-*)` tokens |
| Custom loading spinner | `MnStateScaffold` |
| Colored `<span>` for status | `MnBadge` |
| Custom `<div>` bars | `MnHbar` |
| Custom bordered `<div>` | `MnSectionCard` |
| Direct recharts | `MnChart` |
| Custom tab layout | `MnTabs` |
| Custom search input | `MnSearchDrawer` / `MnCommandPalette` |
| Custom progress bar | `MnProgressRing` |
| Custom sidebar form | `MnFilterPanel` |
