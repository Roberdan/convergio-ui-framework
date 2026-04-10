/**
 * i18n type definitions — Data Display, Data Viz & Feedback namespaces.
 */

/* ── Data Display ── */

export interface DataTableLabels {
  loading: string;
  dataTable: string;
  selectAllRows: string;
  filterPlaceholder: string;
  tablePagination: string;
  previousPage: string;
  nextPage: string;
  rows: string;
}

export interface DetailPanelLabels {
  selectPlaceholder: string;
  edit: string;
  cancel: string;
  save: string;
  close: string;
}

export interface UserTableLabels {
  loading: string;
  searchPlaceholder: string;
  userTable: string;
  selectAllUsers: string;
  user: string;
  status: string;
  role: string;
  teams: string;
  lastActive: string;
  actions: string;
  users: string;
}

export interface SourceCardsLabels {
  noSources: string;
  show: string;
  more: string;
}

export interface TokenMeterLabels {
  tokenBreakdown: string;
}

export interface KpiScorecardLabels {
  kpiScorecard: string;
}

export interface AvatarLabels {
  avatar: string;
}

/* ── Data Viz ── */

export interface ChartLabels {
  segment: string;
  value: string;
  x: string;
  y: string;
  size: string;
}

export interface CohortGridLabels {
  cohortRetentionGrid: string;
  cohort: string;
}

export interface CostTimelineLabels {
  costTimeline: string;
  period: string;
}

export interface FunnelLabels {
  pipelineFunnel: string;
  noStages: string;
  onHold: string;
  withdrawn: string;
}

export interface HbarLabels {
  horizontalBarChart: string;
}

export interface PipelineRankingLabels {
  conversion: string;
}

export interface WaterfallLabels {
  waterfallChart: string;
}

/* ── Feedback ── */

export interface ActivityFeedLabels {
  noActivity: string;
  refreshFeed: string;
  refresh: string;
}

export interface ModalLabels {
  close: string;
}

export interface NotificationCenterLabels {
  notifications: string;
  markAllAsRead: string;
  clearAllNotifications: string;
  clear: string;
  closeNotifications: string;
  loading: string;
  loadingNotifications: string;
  noNotifications: string;
}

export interface StateScaffoldLabels {
  loading: string;
}

export interface StreamingTextLabels {
  streamingResponse: string;
}

export interface ToastLabels {
  close: string;
  notifications: string;
}
