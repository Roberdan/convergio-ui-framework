/**
 * i18n type definitions — Agentic & Network namespaces.
 */

/* ── Agentic ── */

export interface ActiveMissionsLabels {
  noActiveMissions: string;
}

export interface AgentTraceLabels {
  input: string;
  output: string;
  noTraceSteps: string;
  actorLabel: string;
  handoff: string;
  legend: string;
}

export interface ApprovalChainLabels {
  approvalChain: string;
}

export interface AugmentedBrainLabels {
  nodeTypeLegend: string;
}

export interface AugmentedBrainV2Labels {
  pauseAnimation: string;
  playAnimation: string;
}

export interface ChatLabels {
  code: string;
  copied: string;
  copy: string;
  stopListening: string;
  processingSpeech: string;
  voiceError: string;
  startVoiceInput: string;
  thinking: string;
  voiceInput: string;
  sendMessage: string;
}

export interface HubSpokeLabels {
  networkNodes: string;
  hub: string;
  active: string;
}

export interface NeuralNodesLabels {
  neuralNodesVisualization: string;
}

export interface ProcessTimelineLabels {
  defaultAriaLabel: string;
  stepStatus: string;
  duration: string;
  noSteps: string;
}

export interface WorkflowOrchestratorLabels {
  workflowVisualization: string;
  phase: string;
  noNodes: string;
}

/* ── Network ── */

export interface DeploymentTableLabels {
  noDeployments: string;
  hash: string;
}

export interface MapLabels {
  marker: string;
  interactiveMap: string;
}

export interface GeoMapLabels {
  interactiveMap: string;
  loading: string;
  zoomIn: string;
  zoomOut: string;
  resetBearing: string;
  findLocation: string;
  toggleFullscreen: string;
  closePopup: string;
}

export interface MeshNetworkCanvasLabels {
  meshNodes: string;
}

export interface MeshNetworkCardLabels {
  sync: string;
  push: string;
  toggle: string;
}

export interface MeshNetworkToolbarLabels {
  meshNetwork: string;
  syncLabel: string;
  drift: string;
  addPeer: string;
  discover: string;
  fullSync: string;
  pushLabel: string;
  online: string;
}

export interface MeshNetworkLabels {
  noMeshNodes: string;
  meshNodes: string;
}

export interface NetworkMessagesLabels {
  networkMessageFlow: string;
}

export interface OrgChartLabels {
  active: string;
  inactive: string;
  busy: string;
  error: string;
  collapse: string;
  expand: string;
  organizationChart: string;
}

export interface SocialGraphLabels {
  graphNodes: string;
}

export interface SystemStatusLabels {
  systemStatus: string;
  refreshStatus: string;
  noServices: string;
  recentIncidents: string;
}
