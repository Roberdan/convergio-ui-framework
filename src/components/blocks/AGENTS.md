# Block Components

Built-in page blocks used by the PageRenderer. These are NOT Maranello components — they are simpler, always-available blocks for YAML-driven pages.

| Block | Type in YAML | What |
|-------|-------------|------|
| `kpi-card` | `kpi-card` | Single metric with label, value, change, trend |
| `data-table` | `data-table` | Simple table with columns and rows |
| `activity-feed` | `activity-feed` | Chronological event list |
| `stat-list` | `stat-list` | Key-value stat pairs |
| `empty-state` | `empty-state` | Placeholder when no data |
| `ai-chat-panel` | `ai-chat` | AI chat interface (connects to /api/chat) |

Maranello block types (gauge-block, chart-block, etc.) are registered dynamically via `src/lib/block-registry.ts`.
