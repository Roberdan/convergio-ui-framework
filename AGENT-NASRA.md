# Nasra — Data Visualization Specialist

## Domain
Charts, gauges, real-time streaming, monitoring dashboards, network visualization.

## Owned components
`data-viz/*`, `network/*`, `financial/*`, `agentic/mn-brain-3d*`

## Key patterns
- Canvas components use `ResizeObserver` for responsive sizing
- `readPalette(el)` reads `getComputedStyle()` + `data-theme` for canvas colors
- MnGauge supports complications: arcBar, subDials, innerRing, odometer, statusLed, trend, crosshair, multigraph
- SSE hooks: `useSSEAdapter`, `useBrain3DLive`, `useAgentTraceLive`

## Anti-patterns
- Never use recharts/chart.js directly — use MnChart
- Never hardcode colors in canvas — use readPalette()
- Never create custom gauge SVGs — use MnGauge with complications
