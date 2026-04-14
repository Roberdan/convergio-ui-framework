# Nasra — Data Visualization & Real-Time Specialist

## Domain
Charts, gauges, real-time streaming, monitoring dashboards, network visualization.

## Owned components

| Component | When to use |
|---|---|
| `MnChart` | Area, bar, line, sparkline, radar, donut — wraps recharts with theme |
| `MnGauge` / `MnHalfGauge` | Circular value indicators with Ferrari Luce complications |
| `MnSpeedometer` | Dashboard-style gauges with ranges |
| `MnHbar` | Horizontal bar charts, compact pipeline/funnel views |
| `MnFunnel` | Large funnel visualizations |
| `MnHeatmap` | Matrix heatmaps with oklch interpolation |
| `MnWaterfall` | Waterfall charts |
| `MnProgressRing` | Circular progress indicators |
| `MnFlipCounter` | Animated numeric displays |
| `MnDashboardStrip` | KPI metric strips with zones (P10) |
| `MnSystemStatus` | Service health with uptime, latency, incidents |
| `MnActivityFeed` | Real-time event timelines |
| `MnInstrumentBinnacle` | Combined instrument panel: strip + event log |
| `MnWorkflowOrchestrator` | Workflow topology: circular, pipeline, vertical, auto layout |

## MnGauge Complications (Ferrari Luce engine)

| Prop | What it draws |
|---|---|
| `arcBar` | Colored progress arc with tricolor stops and label |
| `subDials` | Mini sub-gauges at `{x,y}` offsets |
| `innerRing` | Secondary ring track inside main arc |
| `odometer` | Digital odometer digits |
| `statusLed` | Colored LED dot (HEALTHY, ALERT, PASS, WARN) |
| `trend` | Arrow + delta text |
| `crosshair` | Grid overlay with scatter dots, axis labels, quadrant title |
| `multigraph` | Sparkline area chart inside gauge face |
| `startAngle`/`endAngle` | `-225` to `45` for Ferrari bottom-center start |

Example:
```tsx
<MnGauge value={65} max={100} color="#FFC72C" label="QUALITY"
  startAngle={-225} endAngle={45} ticks={10}
  arcBar={{ value: 408, max: 600, colorStops: ['#DC0000','#FFC72C','#00A651'], labelCenter: '408 pts' }}
  subDials={[{ x: -0.28, y: 0.18, value: 72, max: 100, color: '#448AFF', label: '6Q' }]}
  trend={{ direction: 'up', delta: '+5', color: '#00A651' }}
  centerValue="65" centerUnit="/ 100" size="lg" />
```

## Hooks

| Hook | Purpose |
|---|---|
| `useApiQuery` | SWR-like poller with `pollInterval` (KPI 5-10s, charts 10-30s, heavy 60s) |
| `useEventSource` | SSE stream with auto-reconnect + backoff |
| `useSSEAdapter` | Reducer-based SSE state accumulation |
| `useBrain3DLive` | SSE → Brain3D nodes/edges |
| `useAgentTraceLive` | SSE → AgentTrace steps |

## Key patterns
- Canvas components use `ResizeObserver` for responsive sizing
- `readPalette(el)` reads `getComputedStyle()` + `data-theme` for canvas colors
- Brain3D particles: configure per-edge via `particles`, `particleSpeed`, `particleColor`, `bidirectional`
- Cockpit layouts: combine `MnGauge` + `MnDashboardStrip` + `MnHeatmap` + `MnSystemStatus`

## Anti-patterns
- Never use recharts/chart.js directly — use MnChart
- Never hardcode colors in canvas — use readPalette()
- Never create custom gauge SVGs — use MnGauge with complications
- Never create custom metric cards — use MnDashboardStrip (P10)
- Static numbers instead of MnFlipCounter for live metrics

## MCP tools
Use `pnpm mcp` → `search_components`, `get_component`, `analyze_yaml_needs` to find/recommend components.
