// Maranello Design System — React Components
// Auto-generated barrel file. Updated by consolidation tasks per wave.

// W1: Simple components
export { MnBadge, type MnBadgeProps } from "./mn-badge"
export { MnAvatar, MnAvatarGroup, type MnAvatarProps, type MnAvatarGroupProps } from "./mn-avatar"
export { MnBreadcrumb, type MnBreadcrumbProps, type BreadcrumbItem } from "./mn-breadcrumb"
export { MnFormField, MnFormFieldLabel, MnFormFieldHint, MnFormFieldError } from "./mn-form-field"
export { MnStateScaffold, type MnStateScaffoldProps } from "./mn-state-scaffold"
export { MnToast, toast } from "./mn-toast"
export { MnTabs, MnTabList, MnTab, MnTabPanel } from "./mn-tabs"
export { MnModal, type MnModalProps } from "./mn-modal"
export { MnCustomerJourney, type MnCustomerJourneyProps } from "./mn-customer-journey"
export { MnDashboard, type MnDashboardProps } from "./mn-dashboard"

// W2: Shell/navigation components
export { MnCommandPalette, type MnCommandPaletteProps, type CommandItem } from "./mn-command-palette"
export { MnHeaderShell, type MnHeaderShellProps } from "./mn-header-shell"
export { MnSectionNav, type MnSectionNavProps, type SectionNavItem } from "./mn-section-nav"
export { MnThemeToggle, type MnThemeToggleProps } from "./mn-theme-toggle"
export { MnThemeRotary, type MnThemeRotaryProps } from "./mn-theme-rotary"
export { MnAsyncSelect, type MnAsyncSelectProps, type AsyncSelectItem } from "./mn-async-select"
export { MnDatePicker, type MnDatePickerProps } from "./mn-date-picker"
export { MnProfile, type ProfileSection, type ProfileSectionItem } from "./mn-profile"
export { MnA11y, type MnA11yProps } from "./mn-a11y"

// W3: Data-heavy components
export { MnDataTable, type MnDataTableProps, type DataTableColumn } from "./mn-data-table"
export { MnDetailPanel, type MnDetailPanelProps, type DetailField, type DetailSection } from "./mn-detail-panel"
export { MnEntityWorkbench, type MnEntityWorkbenchProps, type EntityTab } from "./mn-entity-workbench"
export { MnFacetWorkbench, type MnFacetWorkbenchProps, type FacetGroup, type FacetFilters } from "./mn-facet-workbench"
export { MnChat, type MnChatProps, type ChatMessage, type QuickAction } from "./mn-chat"
export { MnOkr, type MnOkrProps, type Objective, type KeyResult } from "./mn-okr"
export { MnSystemStatus, type MnSystemStatusProps, type Service, type Incident } from "./mn-system-status"

// W4: Canvas/visual components
export { MnChart, type MnChartProps, type ChartSeries, type ChartType } from "./mn-chart"
export { MnGauge, type MnGaugeProps } from "./mn-gauge"
export { MnSpeedometer, type MnSpeedometerProps } from "./mn-speedometer"
export { MnFunnel, type MnFunnelProps, type FunnelStage } from "./mn-funnel"
export { MnHbar, type MnHbarProps, type HBarItem } from "./mn-hbar"
export { MnGantt, type MnGanttProps, type GanttTask } from "./mn-gantt"
export { MnKanbanBoard, type MnKanbanBoardProps, type KanbanColumn, type KanbanCard } from "./mn-kanban-board"
export { MnMap, type MnMapProps, type MapMarker } from "./mn-map"
export { MnManettino, MnCruiseLever, MnToggleLever, MnSteppedRotary } from "./mn-ferrari-control"
export type { MnManettinoProps, MnCruiseLeverProps, MnToggleLeverProps, MnSteppedRotaryProps } from "./mn-ferrari-control"

// Phase 2 — W0: Pre-existing
export { MnBudgetTreemap } from "./mn-budget-treemap";
export type { MnBudgetTreemapProps, TreemapItem } from "./mn-budget-treemap";
export { MnHeatmap } from "./mn-heatmap";
export type { MnHeatmapProps } from "./mn-heatmap";

// Phase 2 — W1: Accessibility + Utilities
export { MnA11yFab } from "./mn-a11y-fab";
export type { A11yPrefs } from "./mn-a11y-fab";
export { MnSpinner } from "./mn-spinner";
export type { MnSpinnerProps } from "./mn-spinner";
export { MnStepper } from "./mn-stepper";
export type { MnStepperProps, Step } from "./mn-stepper";
export { MnToggleSwitch } from "./mn-toggle-switch";
export type { MnToggleSwitchProps } from "./mn-toggle-switch";
export {
  MnDropdownMenu,
  MnDropdownItem,
  MnDropdownSeparator,
  MnDropdownLabel,
} from "./mn-dropdown-menu";
export type {
  MnDropdownMenuProps,
  MnDropdownItemProps,
} from "./mn-dropdown-menu";
export { MnCalendarRange } from "./mn-calendar-range";
export type { MnCalendarRangeProps, DateRange } from "./mn-calendar-range";

// Phase 2 — W2: Advanced Data Visualization
export { MnWaterfall } from "./mn-waterfall";
export type { MnWaterfallProps, WaterfallStep } from "./mn-waterfall";
export { MnDecisionMatrix } from "./mn-decision-matrix";
export type {
  MnDecisionMatrixProps,
  DecisionCriterion,
  DecisionOption,
} from "./mn-decision-matrix";
export { MnPipelineRanking } from "./mn-pipeline-ranking";
export type { MnPipelineRankingProps, PipelineStage } from "./mn-pipeline-ranking";
export { MnActivityFeed } from "./mn-activity-feed";
export type { MnActivityFeedProps, ActivityItem } from "./mn-activity-feed";

/* W3 — Network & Infrastructure */
export { MnMeshNetwork } from "./mn-mesh-network";
export type { MnMeshNetworkProps, MeshNode, MeshEdge } from "./mn-mesh-network";

export { MnHubSpoke } from "./mn-hub-spoke";
export type { MnHubSpokeProps, HubSpokeHub, HubSpokeSpoke } from "./mn-hub-spoke";

export { MnDeploymentTable } from "./mn-deployment-table";
export type { MnDeploymentTableProps, Deployment } from "./mn-deployment-table";

export { MnAuditLog } from "./mn-audit-log";
export type { MnAuditLogProps, AuditEntry } from "./mn-audit-log";

export { MnActiveMissions } from "./mn-active-missions";
export type { MnActiveMissionsProps, Mission } from "./mn-active-missions";

export { MnNightJobs } from "./mn-night-jobs";
export type { MnNightJobsProps, NightJob } from "./mn-night-jobs";

/* W4 — Agentic & Intelligence */
export { MnAugmentedBrain } from "./mn-augmented-brain";
export type { MnAugmentedBrainProps, BrainNode, BrainConnection } from "./mn-augmented-brain";

export { MnBinnacle } from "./mn-binnacle";
export type { MnBinnacleProps, BinnacleEntry } from "./mn-binnacle";

export { MnDashboardStrip } from "./mn-dashboard-strip";
export type { MnDashboardStripProps, StripMetric, StripZone, StripGaugeZone, StripPipelineZone, StripTrendZone, StripBoardZone } from "./mn-dashboard-strip";

export { MnInstrumentBinnacle } from "./mn-instrument-binnacle";
export type { MnInstrumentBinnacleProps } from "./mn-instrument-binnacle";

export { MnOrgChart } from "./mn-org-chart";
export type { MnOrgChartProps, OrgNode } from "./mn-org-chart";

/* W5 — Strategy & Business Frameworks */
export { MnStrategyCanvas } from "./mn-strategy-canvas";
export type { MnStrategyCanvasProps, CanvasSegment } from "./mn-strategy-canvas";

export { MnSwot } from "./mn-swot";
export type { MnSwotProps } from "./mn-swot";

export { MnPorterFiveForces } from "./mn-porter-five-forces";
export type { MnPorterFiveForcesProps, Force, ForceLevel } from "./mn-porter-five-forces";

export { MnFinOps } from "./mn-finops";
export type { MnFinOpsProps, FinOpsMetric, TrendDirection } from "./mn-finops";

export { MnCustomerJourneyMap } from "./mn-customer-journey-map";
export type {
  MnCustomerJourneyMapProps,
  JourneyStage,
  Touchpoint,
  Sentiment,
} from "./mn-customer-journey-map";

/* ── Plan 10052 — Design Parity Components ───────────────── */

/* W1: Gauges & Instruments */
export { MnHalfGauge, halfGaugeWrap } from "./mn-half-gauge";
export type { MnHalfGaugeProps, HalfGaugeColorStop } from "./mn-half-gauge";

export { MnProgressRing } from "./mn-progress-ring";
export type { MnProgressRingProps } from "./mn-progress-ring";

export { MnFlipCounter, counterVariants } from "./mn-flip-counter";
export type { MnFlipCounterProps } from "./mn-flip-counter";

/* W2: Network & Agents */
export { MnNeuralNodes, neuralNodesWrap } from "./mn-neural-nodes";
export type { MnNeuralNodesProps, NeuralNodeData, NeuralConnection, NeuralNodesController } from "./mn-neural-nodes";

export { MnNetworkMessages, networkWrap } from "./mn-network-messages";
export type { MnNetworkMessagesProps, NetNode, NetMessage, NetConnection, NetworkMessagesController } from "./mn-network-messages";

export { MnAgentTrace } from "./mn-agent-trace";
export type { MnAgentTraceProps, TraceStep, TraceStepStatus, TraceStepKind } from "./mn-agent-trace";

export { MnTokenMeter, tokenMeterWrap } from "./mn-token-meter";
export type { MnTokenMeterProps, TokenUsage } from "./mn-token-meter";

export { MnStreamingText, streamingTextVariants } from "./mn-streaming-text";
export type { MnStreamingTextProps } from "./mn-streaming-text";

export { MnSocialGraph, socialGraphWrap } from "./mn-social-graph";
export type { MnSocialGraphProps, SocialGraphNode, SocialGraphEdge } from "./mn-social-graph";

/* W3: Strategy & Business */
export { MnBcgMatrix, bcgMatrixWrap } from "./mn-bcg-matrix";
export type { MnBcgMatrixProps, BCGItem } from "./mn-bcg-matrix";

export { MnNineBoxMatrix } from "./mn-nine-box-matrix";
export type { MnNineBoxMatrixProps, NineBoxItem } from "./mn-nine-box-matrix";

export { MnRiskMatrix } from "./mn-risk-matrix";
export type { MnRiskMatrixProps, RiskItem } from "./mn-risk-matrix";

export { MnBusinessModelCanvas, blockVariants, itemVariants } from "./mn-business-model-canvas";
export type { MnBusinessModelCanvasProps, BmcBlockId, BmcItem, BmcBlock } from "./mn-business-model-canvas";

export { MnApprovalChain } from "./mn-approval-chain";
export type { MnApprovalChainProps, ApprovalStep, ApprovalStatus } from "./mn-approval-chain";

export { MnKpiScorecard } from "./mn-kpi-scorecard";
export type { MnKpiScorecardProps, KpiRow, KpiStatus } from "./mn-kpi-scorecard";

export { MnCohortGrid } from "./mn-cohort-grid";
export type { MnCohortGridProps, CohortRow } from "./mn-cohort-grid";

/* W4: Data Tables & Charts */
export { MnAgentCostBreakdown } from "./mn-agent-cost-breakdown";
export type { MnAgentCostBreakdownProps, AgentCostRow } from "./mn-agent-cost-breakdown";

export { MnCostTimeline, costTimelineWrap } from "./mn-cost-timeline";
export type { MnCostTimelineProps, CostSeries } from "./mn-cost-timeline";

export { MnUserTable } from "./mn-user-table";
export type { MnUserTableProps, AdminUser, UserRole, UserStatus, UserAction } from "./mn-user-table";

export { MnBulletChart, bulletChartVariants } from "./mn-bullet-chart";
export type { MnBulletChartProps, BulletRange } from "./mn-bullet-chart";

export { MnConfidenceChart, confidenceChartVariants } from "./mn-confidence-chart";
export type { MnConfidenceChartProps } from "./mn-confidence-chart";

export { MnSourceCards } from "./mn-source-cards";
export type { MnSourceCardsProps, SourceCard, SourceCardLayout } from "./mn-source-cards";

/* W5: Controls, Forms & Navigation */
export { MnNotificationCenter } from "./mn-notification-center";
export type { MnNotificationCenterProps, MnNotification } from "./mn-notification-center";

export { MnFilterPanel, filterPanelVariants } from "./mn-filter-panel";
export type { MnFilterPanelProps, FilterSection, FilterOption, ActiveFilters, RangeConfig } from "./mn-filter-panel";

export { MnSearchDrawer } from "./mn-search-drawer";
export type { MnSearchDrawerProps, SearchDrawerResult, SearchDrawerSection } from "./mn-search-drawer";

export { MnDateRangePicker } from "./mn-date-range-picker";
export type { MnDateRangePickerProps } from "./mn-date-range-picker";

export { MnSettingsPanel } from "./mn-settings-panel";
export type { MnSettingsPanelProps, SettingsSection, SettingsItemType } from "./mn-settings-panel";

export { MnAdminShell } from "./mn-admin-shell";
export type { MnAdminShellProps, AdminShellNavItem, AdminShellBreadcrumb } from "./mn-admin-shell";

export { MnLogin } from "./mn-login";
export type { MnLoginProps } from "./mn-login";

/* W6: Icons & Design Tokens */
export { MnIcon, mnIconVariants, mnIconCatalog } from "./mn-icon";
export type { MnIconProps, MnIconName, MnIconEntry } from "./mn-icon";

export {
  THEME_COLORS, SPACING, FONT_FAMILY, TEXT_SIZE,
} from "./mn-design-tokens";
export type { MnThemeId, MnSemanticColors, MnThemeColors } from "./mn-design-tokens";

/* W7: Utilities & Runtime */
export { MnVoiceInput, useVoiceInput } from "./mn-voice-input";
export type { MnVoiceInputProps, VoiceState } from "./mn-voice-input";

export { MnGridLayout, MnGridItem, gridVariants } from "./mn-grid-layout";
export type { MnGridLayoutProps, MnGridItemProps } from "./mn-grid-layout";

export { MnSectionCard, sectionCardVariants } from "./mn-section-card";
export type { MnSectionCardProps } from "./mn-section-card";

export { MnDashboardRenderer } from "./mn-dashboard-renderer";
export type { MnDashboardRendererProps } from "./mn-dashboard-renderer";

export {
  transition, createLayoutContext, stateForViewport, canToggleSidebar,
  DEFAULT_BREAKPOINTS,
} from "./mn-layout-state-machine";
export type { MnLayoutState, MnLayoutAction, MnLayoutContext } from "./mn-layout-state-machine";
