import type {
  DeploymentTableLabels, GeoMapLabels, MapLabels, MeshNetworkCanvasLabels,
  MeshNetworkCardLabels, MeshNetworkToolbarLabels, MeshNetworkLabels,
  NetworkMessagesLabels, OrgChartLabels, SocialGraphLabels,
  SystemStatusLabels,
} from "../types";

export const deploymentTableDefaults: DeploymentTableLabels = {
  noDeployments: "No deployments to display.",
  hash: "Hash",
};

export const mapDefaults: MapLabels = {
  marker: "Marker",
  interactiveMap: "Interactive map",
};

export const geoMapDefaults: GeoMapLabels = {
  interactiveMap: "Interactive geographic map",
  loading: "Loading map",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetBearing: "Reset bearing to north",
  findLocation: "Find my location",
  toggleFullscreen: "Toggle fullscreen",
  closePopup: "Close popup",
};

export const meshNetworkCanvasDefaults: MeshNetworkCanvasLabels = {
  meshNodes: "Mesh nodes",
};

export const meshNetworkCardDefaults: MeshNetworkCardLabels = {
  sync: "Sync",
  push: "Push",
  toggle: "Toggle",
};

export const meshNetworkToolbarDefaults: MeshNetworkToolbarLabels = {
  meshNetwork: "MESH NETWORK",
  syncLabel: "Sync",
  drift: "Drift",
  addPeer: "+ Add Peer",
  discover: "Discover",
  fullSync: "Full Sync",
  pushLabel: "Push",
  online: "online",
};

export const meshNetworkDefaults: MeshNetworkLabels = {
  noMeshNodes: "No mesh nodes to display.",
  meshNodes: "Mesh nodes",
};

export const networkMessagesDefaults: NetworkMessagesLabels = {
  networkMessageFlow: "Network message flow",
};

export const orgChartDefaults: OrgChartLabels = {
  active: "Active",
  inactive: "Inactive",
  busy: "Busy",
  error: "Error",
  collapse: "Collapse",
  expand: "Expand",
  organizationChart: "Organization chart",
};

export const socialGraphDefaults: SocialGraphLabels = {
  graphNodes: "Graph nodes",
};

export const systemStatusDefaults: SystemStatusLabels = {
  systemStatus: "System status",
  refreshStatus: "Refresh status",
  noServices: "No services configured.",
  recentIncidents: "Recent Incidents",
};
