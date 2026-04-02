/**
 * Configuration types -- re-exports from split modules.
 * Split for 250-line-per-file compliance.
 */
export type { AppConfig, NavItem, NavSection, NavConfig } from "./config-base";
export type {
  KpiCardBlock,
  DataTableBlock,
  ActivityFeedBlock,
  StatListBlock,
  EmptyStateBlock,
  AIChatBlock,
  PageRow,
  PageConfig,
} from "./config-pages";
export type {
  GaugeBlock,
  ChartBlock,
  GanttBlockTask,
  GanttBlock,
  KanbanBlock,
  FunnelBlock,
  HbarBlock,
  SpeedometerBlock,
  MapBlock,
  OkrBlockKeyResult,
  OkrBlockObjective,
  OkrBlock,
  SystemStatusBlock,
  DataTableMaranelloBlock,
  PageBlock,
} from "./config-ai";
