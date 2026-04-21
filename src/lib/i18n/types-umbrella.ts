/**
 * i18n umbrella types — aggregate interface and deep-partial variant.
 */

import type {
  ShellLabels,
  HeaderLabels,
  SearchComboboxLabels,
  SidebarLabels,
  A11yFabLabels,
  A11yLabels,
  ThemeToggleLabels,
  ThemeRotaryLabels,
  FerrariControlLabels,
} from "./types-shell-theme";

import type {
  DataTableLabels,
  DetailPanelLabels,
  UserTableLabels,
  SourceCardsLabels,
  TokenMeterLabels,
  KpiScorecardLabels,
  AvatarLabels,
  ChartLabels,
  CohortGridLabels,
  CostTimelineLabels,
  FunnelLabels,
  HbarLabels,
  PipelineRankingLabels,
  WaterfallLabels,
  ActivityFeedLabels,
  ModalLabels,
  NotificationCenterLabels,
  StateScaffoldLabels,
  StreamingTextLabels,
  ToastLabels,
} from "./types-data";

import type {
  AsyncSelectLabels,
  CalendarRangeLabels,
  DatePickerLabels,
  DateRangePickerLabels,
  FilterPanelLabels,
  LoginLabels,
  ProfileLabels,
  SearchDrawerLabels,
  VoiceInputLabels,
  AdminShellLabels,
  DashboardRendererLabels,
  DashboardLabels,
  DashboardStripLabels,
  HeaderShellLabels,
  BreadcrumbLabels,
  CommandPaletteLabels,
  SectionNavLabels,
  StepperLabels,
} from "./types-forms-nav";

import type {
  ActiveMissionsLabels,
  AgentTraceLabels,
  ApprovalChainLabels,
  AugmentedBrainLabels,
  AugmentedBrainV2Labels,
  ChatLabels,
  HubSpokeLabels,
  NeuralNodesLabels,
  WorkflowOrchestratorLabels,
  ProcessTimelineLabels,
  DeploymentTableLabels,  MapLabels, GeoMapLabels,
  MeshNetworkCanvasLabels,
  MeshNetworkCardLabels,
  MeshNetworkToolbarLabels,
  MeshNetworkLabels,
  NetworkMessagesLabels,
  OrgChartLabels,
  SocialGraphLabels,
  SystemStatusLabels,
} from "./types-agentic-network";

import type {
  AuditLogLabels,
  BinnacleLabels,
  EntityWorkbenchLabels,
  FacetWorkbenchLabels,
  GanttLabels,
  KanbanBoardLabels,
  NightJobsLabels,
  InstrumentBinnacleLabels,
  BusinessModelCanvasLabels,
  CustomerJourneyMapLabels,
  CustomerJourneyLabels,
  DecisionMatrixLabels,
  OkrLabels,
  RiskMatrixLabels,
  StrategyCanvasLabels,
  SwotLabels,
  NineBoxMatrixLabels,
  PorterFiveForcesLabels,
  AgentCostBreakdownLabels,
  FinOpsLabels,
  ErrorPageLabels,
  NotFoundLabels,
  LoginPageLabels,
  DialogLabels,
  SheetLabels,
} from "./types-ops-strategy";

/* ── Umbrella type ── */

export interface LocaleMessages {
  shell: ShellLabels;
  header: HeaderLabels;
  searchCombobox: SearchComboboxLabels;
  sidebar: SidebarLabels;
  a11yFab: A11yFabLabels;
  a11y: A11yLabels;
  themeToggle: ThemeToggleLabels;
  themeRotary: ThemeRotaryLabels;
  ferrariControl: FerrariControlLabels;
  dataTable: DataTableLabels;
  detailPanel: DetailPanelLabels;
  userTable: UserTableLabels;
  sourceCards: SourceCardsLabels;
  tokenMeter: TokenMeterLabels;
  kpiScorecard: KpiScorecardLabels;
  avatar: AvatarLabels;
  chart: ChartLabels;
  cohortGrid: CohortGridLabels;
  costTimeline: CostTimelineLabels;
  funnel: FunnelLabels;
  hbar: HbarLabels;
  pipelineRanking: PipelineRankingLabels;
  waterfall: WaterfallLabels;
  activityFeed: ActivityFeedLabels;
  modal: ModalLabels;
  notificationCenter: NotificationCenterLabels;
  stateScaffold: StateScaffoldLabels;
  streamingText: StreamingTextLabels;
  toast: ToastLabels;
  asyncSelect: AsyncSelectLabels;
  calendarRange: CalendarRangeLabels;
  datePicker: DatePickerLabels;
  dateRangePicker: DateRangePickerLabels;
  filterPanel: FilterPanelLabels;
  login: LoginLabels;
  profile: ProfileLabels;
  searchDrawer: SearchDrawerLabels;
  voiceInput: VoiceInputLabels;
  adminShell: AdminShellLabels;
  dashboardRenderer: DashboardRendererLabels;
  dashboard: DashboardLabels;
  dashboardStrip: DashboardStripLabels;
  headerShell: HeaderShellLabels;
  breadcrumb: BreadcrumbLabels;
  commandPalette: CommandPaletteLabels;
  sectionNav: SectionNavLabels;
  stepper: StepperLabels;
  activeMissions: ActiveMissionsLabels;
  agentTrace: AgentTraceLabels;
  approvalChain: ApprovalChainLabels;
  augmentedBrain: AugmentedBrainLabels;
  augmentedBrainV2: AugmentedBrainV2Labels;
  chat: ChatLabels;
  hubSpoke: HubSpokeLabels;
  neuralNodes: NeuralNodesLabels;
  processTimeline: ProcessTimelineLabels;
  workflowOrchestrator: WorkflowOrchestratorLabels;
  deploymentTable: DeploymentTableLabels;
  map: MapLabels;
  geoMap: GeoMapLabels;
  meshNetworkCanvas: MeshNetworkCanvasLabels;
  meshNetworkCard: MeshNetworkCardLabels;
  meshNetworkToolbar: MeshNetworkToolbarLabels;
  meshNetwork: MeshNetworkLabels;
  networkMessages: NetworkMessagesLabels;
  orgChart: OrgChartLabels;
  socialGraph: SocialGraphLabels;
  systemStatus: SystemStatusLabels;
  auditLog: AuditLogLabels;
  binnacle: BinnacleLabels;
  entityWorkbench: EntityWorkbenchLabels;
  facetWorkbench: FacetWorkbenchLabels;
  gantt: GanttLabels;
  kanbanBoard: KanbanBoardLabels;
  nightJobs: NightJobsLabels;
  instrumentBinnacle: InstrumentBinnacleLabels;
  businessModelCanvas: BusinessModelCanvasLabels;
  customerJourneyMap: CustomerJourneyMapLabels;
  customerJourney: CustomerJourneyLabels;
  decisionMatrix: DecisionMatrixLabels;
  okr: OkrLabels;
  riskMatrix: RiskMatrixLabels;
  strategyCanvas: StrategyCanvasLabels;
  swot: SwotLabels;
  nineBoxMatrix: NineBoxMatrixLabels;
  porterFiveForces: PorterFiveForcesLabels;
  agentCostBreakdown: AgentCostBreakdownLabels;
  finOps: FinOpsLabels;
  errorPage: ErrorPageLabels;
  notFound: NotFoundLabels;
  loginPage: LoginPageLabels;
  dialog: DialogLabels;
  sheet: SheetLabels;
}

/** Deep-partial version: override only the keys you need. */
export type PartialLocaleMessages = {
  [K in keyof LocaleMessages]?: Partial<LocaleMessages[K]>;
};
