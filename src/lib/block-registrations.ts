/**
 * Default block registrations — registers all block types for PageRenderer.
 *
 * This file imports all .register.ts sidecar files to ensure all block
 * types are available to the PageRenderer. Consumer apps that use only
 * specific components can skip this import and cherry-pick individual
 * .register.ts files instead.
 *
 * Import this file once in your app (e.g. in the dashboard layout):
 * ```ts
 * import "@/lib/block-registrations";
 * ```
 */

/* ── Built-in blocks (eager) ── */
import "@/components/blocks/kpi-card.register";
import "@/components/blocks/data-table.register";
import "@/components/blocks/activity-feed.register";
import "@/components/blocks/stat-list.register";
import "@/components/blocks/empty-state.register";
import "@/components/blocks/ai-chat.register";
import "@/components/blocks/chart-block.register";

/* ── Maranello data-viz blocks (lazy) ── */
import "@/components/maranello/data-viz/mn-gauge.register";
import "@/components/maranello/data-viz/mn-funnel.register";
import "@/components/maranello/data-viz/mn-hbar.register";
import "@/components/maranello/data-viz/mn-speedometer.register";

/* ── Maranello network blocks ── */
import "@/components/maranello/network/mn-map.register";
import "@/components/maranello/network/mn-system-status.register";

/* ── Maranello data-display blocks ── */
import "@/components/maranello/data-display/mn-data-table.register";

/* ── Maranello ops blocks ── */
import "@/components/maranello/ops/mn-gantt.register";
import "@/components/maranello/ops/mn-kanban-board.register";

/* ── Maranello strategy blocks ── */
import "@/components/maranello/strategy/mn-okr.register";

/* ── Maranello agentic blocks ── */
import "@/components/maranello/agentic/mn-workflow-orchestrator.register";
