/**
 * i18n type definitions — Ops, Strategy, Financial & Page-level namespaces.
 */

/* ── Ops ── */

export interface AuditLogLabels {
  noAuditEntries: string;
  filterAuditLog: string;
  filterPlaceholder: string;
  entries: string;
  loadMore: string;
}

export interface BinnacleLabels {
  noLogEntries: string;
  entries: string;
  filter: string;
  filterBySeverity: string;
}

export interface EntityWorkbenchLabels {
  unsavedChanges: string;
  newTab: string;
  noEntitiesOpen: string;
  save: string;
}

export interface FacetWorkbenchLabels {
  clear: string;
  clearAll: string;
  activeFilter: string;
  activeFilters: string;
}

export interface GanttLabels {
  today: string;
  zoomIn: string;
  zoomOut: string;
  fitTimeline: string;
  ganttTimeline: string;
  todayMarker: string;
  task: string;
  expand: string;
  collapse: string;
}

export interface KanbanBoardLabels {
  kanbanBoard: string;
  addCard: string;
}

export interface NightJobsLabels {
  noScheduledJobs: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
}

export interface InstrumentBinnacleLabels {
  instrumentPanel: string;
  keyMetrics: string;
  eventLog: string;
}

/* ── Strategy ── */

export interface BusinessModelCanvasLabels {
  enterItem: string;
  confirm: string;
  businessModelCanvas: string;
}

export interface CustomerJourneyMapLabels {
  noTouchpoints: string;
}

export interface CustomerJourneyLabels {
  customerJourney: string;
}

export interface DecisionMatrixLabels {
  option: string;
  total: string;
  winner: string;
  best: string;
}

export interface OkrLabels {
  noObjectives: string;
}

export interface RiskMatrixLabels {
  impact: string;
  probability: string;
  critical: string;
}

export interface StrategyCanvasLabels {
  newItem: string;
  cancel: string;
  add: string;
}

export interface SwotLabels {
  noItems: string;
}

export interface NineBoxMatrixLabels {
  performance: string;
  potential: string;
  low: string;
  medium: string;
  high: string;
}

export interface PorterFiveForcesLabels {
  low: string;
  medium: string;
  high: string;
  porterFiveForces: string;
}

/* ── Financial ── */

export interface AgentCostBreakdownLabels {
  agentCostBreakdown: string;
  agentCostBreakdownAria: string;
  total: string;
  agentsTotalCost: string;
}

export interface FinOpsLabels {
  actual: string;
  budget: string;
}

/* ── Error Pages ── */

export interface ErrorPageLabels {
  somethingWentWrong: string;
  unexpectedError: string;
  sectionError: string;
  tryAgain: string;
  goToDashboard: string;
}

export interface NotFoundLabels {
  pageNotFound: string;
  pageNotFoundDescription: string;
  backToDashboard: string;
}

/* ── Login Page ── */

export interface LoginPageLabels {
  signIn: string;
  enterCredentials: string;
  username: string;
  usernamePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signInButton: string;
  noAccount: string;
}

/* ── UI Primitives ── */

export interface DialogLabels {
  close: string;
}

export interface SheetLabels {
  close: string;
}
