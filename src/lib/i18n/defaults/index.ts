export * from "./shell";
export * from "./theme";
export * from "./data-display";
export * from "./data-viz";
export * from "./feedback";
export * from "./forms";
export * from "./layout";
export * from "./navigation";
export * from "./agentic";
export * from "./network";
export * from "./ops";
export * from "./strategy";
export * from "./financial";
export * from "./pages";

import type { LocaleMessages } from "../types";

import { shellDefaults, headerDefaults, searchComboboxDefaults, sidebarDefaults } from "./shell";
import { a11yFabDefaults, a11yDefaults, themeToggleDefaults, themeRotaryDefaults, ferrariControlDefaults } from "./theme";
import { dataTableDefaults, detailPanelDefaults, userTableDefaults, sourceCardsDefaults, tokenMeterDefaults, kpiScorecardDefaults, avatarDefaults } from "./data-display";
import { chartDefaults, cohortGridDefaults, costTimelineDefaults, funnelDefaults, hbarDefaults, pipelineRankingDefaults, waterfallDefaults } from "./data-viz";
import { activityFeedDefaults, modalDefaults, notificationCenterDefaults, stateScaffoldDefaults, streamingTextDefaults, toastDefaults } from "./feedback";
import { asyncSelectDefaults, calendarRangeDefaults, datePickerDefaults, dateRangePickerDefaults, filterPanelDefaults, loginDefaults, profileDefaults, searchDrawerDefaults, voiceInputDefaults } from "./forms";
import { adminShellDefaults, dashboardRendererDefaults, dashboardDefaults, dashboardStripDefaults, headerShellDefaults } from "./layout";
import { breadcrumbDefaults, commandPaletteDefaults, sectionNavDefaults, stepperDefaults } from "./navigation";
import { activeMissionsDefaults, agentTraceDefaults, approvalChainDefaults, augmentedBrainDefaults, augmentedBrainV2Defaults, chatDefaults, hubSpokeDefaults, neuralNodesDefaults, processTimelineDefaults, workflowOrchestratorDefaults } from "./agentic";
import { deploymentTableDefaults, geoMapDefaults, mapDefaults, meshNetworkCanvasDefaults, meshNetworkCardDefaults, meshNetworkToolbarDefaults, meshNetworkDefaults, networkMessagesDefaults, orgChartDefaults, socialGraphDefaults, systemStatusDefaults } from "./network";
import { auditLogDefaults, binnacleDefaults, entityWorkbenchDefaults, facetWorkbenchDefaults, ganttDefaults, kanbanBoardDefaults, nightJobsDefaults, instrumentBinnacleDefaults } from "./ops";
import { businessModelCanvasDefaults, customerJourneyMapDefaults, customerJourneyDefaults, decisionMatrixDefaults, okrDefaults, riskMatrixDefaults, strategyCanvasDefaults, swotDefaults, nineBoxMatrixDefaults, porterFiveForcesDefaults } from "./strategy";
import { agentCostBreakdownDefaults, finOpsDefaults } from "./financial";
import { errorPageDefaults, notFoundDefaults, loginPageDefaults, dialogDefaults, sheetDefaults } from "./pages";

/** Complete English default messages for all namespaces. */
export const DEFAULT_MESSAGES: LocaleMessages = {
  shell: shellDefaults,
  header: headerDefaults,
  searchCombobox: searchComboboxDefaults,
  sidebar: sidebarDefaults,
  a11yFab: a11yFabDefaults,
  a11y: a11yDefaults,
  themeToggle: themeToggleDefaults,
  themeRotary: themeRotaryDefaults,
  ferrariControl: ferrariControlDefaults,
  dataTable: dataTableDefaults,
  detailPanel: detailPanelDefaults,
  userTable: userTableDefaults,
  sourceCards: sourceCardsDefaults,
  tokenMeter: tokenMeterDefaults,
  kpiScorecard: kpiScorecardDefaults,
  avatar: avatarDefaults,
  chart: chartDefaults,
  cohortGrid: cohortGridDefaults,
  costTimeline: costTimelineDefaults,
  funnel: funnelDefaults,
  hbar: hbarDefaults,
  pipelineRanking: pipelineRankingDefaults,
  waterfall: waterfallDefaults,
  activityFeed: activityFeedDefaults,
  modal: modalDefaults,
  notificationCenter: notificationCenterDefaults,
  stateScaffold: stateScaffoldDefaults,
  streamingText: streamingTextDefaults,
  toast: toastDefaults,
  asyncSelect: asyncSelectDefaults,
  calendarRange: calendarRangeDefaults,
  datePicker: datePickerDefaults,
  dateRangePicker: dateRangePickerDefaults,
  filterPanel: filterPanelDefaults,
  login: loginDefaults,
  profile: profileDefaults,
  searchDrawer: searchDrawerDefaults,
  voiceInput: voiceInputDefaults,
  adminShell: adminShellDefaults,
  dashboardRenderer: dashboardRendererDefaults,
  dashboard: dashboardDefaults,
  dashboardStrip: dashboardStripDefaults,
  headerShell: headerShellDefaults,
  breadcrumb: breadcrumbDefaults,
  commandPalette: commandPaletteDefaults,
  sectionNav: sectionNavDefaults,
  stepper: stepperDefaults,
  activeMissions: activeMissionsDefaults,
  agentTrace: agentTraceDefaults,
  approvalChain: approvalChainDefaults,
  augmentedBrain: augmentedBrainDefaults,
  augmentedBrainV2: augmentedBrainV2Defaults,
  chat: chatDefaults,
  hubSpoke: hubSpokeDefaults,
  neuralNodes: neuralNodesDefaults,
  processTimeline: processTimelineDefaults,
  workflowOrchestrator: workflowOrchestratorDefaults,
  deploymentTable: deploymentTableDefaults,
  map: mapDefaults,
  geoMap: geoMapDefaults,
  meshNetworkCanvas: meshNetworkCanvasDefaults,
  meshNetworkCard: meshNetworkCardDefaults,
  meshNetworkToolbar: meshNetworkToolbarDefaults,
  meshNetwork: meshNetworkDefaults,
  networkMessages: networkMessagesDefaults,
  orgChart: orgChartDefaults,
  socialGraph: socialGraphDefaults,
  systemStatus: systemStatusDefaults,
  auditLog: auditLogDefaults,
  binnacle: binnacleDefaults,
  entityWorkbench: entityWorkbenchDefaults,
  facetWorkbench: facetWorkbenchDefaults,
  gantt: ganttDefaults,
  kanbanBoard: kanbanBoardDefaults,
  nightJobs: nightJobsDefaults,
  instrumentBinnacle: instrumentBinnacleDefaults,
  businessModelCanvas: businessModelCanvasDefaults,
  customerJourneyMap: customerJourneyMapDefaults,
  customerJourney: customerJourneyDefaults,
  decisionMatrix: decisionMatrixDefaults,
  okr: okrDefaults,
  riskMatrix: riskMatrixDefaults,
  strategyCanvas: strategyCanvasDefaults,
  swot: swotDefaults,
  nineBoxMatrix: nineBoxMatrixDefaults,
  porterFiveForces: porterFiveForcesDefaults,
  agentCostBreakdown: agentCostBreakdownDefaults,
  finOps: finOpsDefaults,
  errorPage: errorPageDefaults,
  notFound: notFoundDefaults,
  loginPage: loginPageDefaults,
  dialog: dialogDefaults,
  sheet: sheetDefaults,
};
