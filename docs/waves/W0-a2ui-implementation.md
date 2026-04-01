# W0 — A2UI Protocol Implementation

Wave ID: 2513 | Plan: 10050 | Date: 01 Aprile 2026

## Summary

Frontend consumer for the A2UI (Agent-to-UI) protocol. Backend agents push UI blocks to the daemon, and the frontend renders them in real-time via SSE streaming.

## Architecture

| Layer | File | Purpose |
|---|---|---|
| Types | `src/lib/a2ui/types.ts` | Block, payload, event, response types |
| Store | `src/lib/a2ui/store.tsx` | React context + reducer for block state |
| Client | `src/lib/a2ui/client.ts` | SSE client with exponential backoff + REST hydration |
| Renderer | `src/components/a2ui/block-renderer.tsx` | Renders blocks by type with dismiss |
| Container | `src/components/a2ui/a2ui-container.tsx` | Filters blocks by page/position for shell |
| Stream | `src/components/blocks/a2ui-stream.tsx` | Dashboard widget showing live activity feed |

## Daemon Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/a2ui/blocks` | List active blocks (REST hydration) |
| POST | `/api/a2ui/push` | Push a new block |
| GET | `/api/a2ui/stream` | SSE event stream |
| POST | `/api/a2ui/dismiss/:id` | Dismiss a block |

## Block Types

| Type | Renders as |
|---|---|
| notification | Card with title/body |
| alert | Severity-colored card (info/warning/error/success) |
| progress | Progress bar with percentage |
| card | Generic card |
| chart | Chart metadata (type + point count) |
| table | Full HTML table |

## Integration

The `A2UIProvider` wraps the app shell. `A2UIContainer` is placed at the top of the main content area and filters blocks by `target_page` (current pathname) and `target_position`. The SSE client auto-reconnects with exponential backoff (1s to 30s cap).

## Tasks

| ID | Title | Status |
|---|---|---|
| T0-01 (10139) | Block store + SSE client + REST hydration | submitted |
| T0-02 (10140) | BlockRenderer + shell integration | submitted |
| T0-03 (10141) | A2UI visual dashboard component | submitted |
| W0-doc (10142) | Documentation | submitted |
