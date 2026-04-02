/**
 * Block component registry.
 *
 * All available page block types are exported here.
 * The PageRenderer maps block config `type` fields to these components.
 *
 * To add a new block:
 * 1. Define the interface in src/types/config.ts
 * 2. Add it to the PageBlock union type
 * 3. Create the component in src/components/blocks/
 * 4. Export it here
 * 5. Register it in the PageRenderer switch
 *
 * Available blocks:
 * - KpiCard: headline metric (label + value + trend)
 * - DataTable: tabular data with columns and rows
 * - ActivityFeed: chronological event stream
 * - StatList: vertical label-value pairs with status
 * - EmptyState: placeholder for empty sections
 * - AIChatPanel: streaming AI agent chat interface
 * - A2UIStream: live A2UI activity feed/timeline
 */
export { KpiCard } from "./kpi-card";
export { DataTable } from "./data-table";
export { ActivityFeed } from "./activity-feed";
export { StatList } from "./stat-list";
export { EmptyState } from "./empty-state";
export { AIChatPanel } from "./ai-chat-panel";
export { BlockWrapper } from "./block-wrapper";
export type { BlockWrapperProps } from "./block-wrapper";
export { A2UIStream } from "./a2ui-stream";
export type { A2UIStreamProps } from "./a2ui-stream";
