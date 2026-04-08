# ADR 0004: Gauge Complications Engine (Crosshair, Multigraph)

Status: Accepted | Date: 08 Apr 2026

## Context

The old `convergio-design` demo had rich Ferrari Luce-inspired gauge instruments with complications: crosshair grids with scatter dots, multigraph sparkline overlays, center text overrides, and quadrant counts. These were implemented in `gauge-engine-complications.ts` in the IIFE/web-component build.

When the React `MnGauge` component was created for `convergio-frontend`, it supported basic complications (arcBar, subDials, innerRing, odometer, statusLed, trend) but was missing crosshair and multigraph — the two most visually distinctive features of the old cockpit demo.

## Decision

Port crosshair and multigraph to the React gauge engine:

- **New file:** `mn-gauge-crosshair.ts` (167 lines) — separated from `mn-gauge.helpers.ts` to respect the 250-line limit
- **New props on MnGauge:** `crosshair`, `quadrantCounts`, `multigraph`, `centerValue`, `centerUnit`
- **Render function extended:** the main `render()` in helpers calls `drawCrosshair()` / `drawMultigraph()` after all other complications
- **Types exported** from the barrel: `Crosshair`, `CrosshairScatterDot`, `QuadrantCounts`, `Multigraph`

## Consequences

- Positive: The cockpit showcase now faithfully reproduces all old demo instruments
- Positive: Any agent can build Portfolio Map gauges, Quality Trend sparklines, etc.
- Positive: No breaking changes — all new props are optional
- Negative: The render function signature grew (22 params) — could be refactored to an options object in a future pass
