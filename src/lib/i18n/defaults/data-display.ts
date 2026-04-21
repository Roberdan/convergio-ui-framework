import type {
  DataTableLabels, DetailPanelLabels, UserTableLabels,
  SourceCardsLabels, TokenMeterLabels, KpiScorecardLabels, AvatarLabels,
} from "../types";

export const dataTableDefaults: DataTableLabels = {
  loading: "Loading...",
  dataTable: "Data table",
  selectAllRows: "Select all rows",
  filterPlaceholder: "Filter...",
  tablePagination: "Table pagination",
  previousPage: "Previous page",
  nextPage: "Next page",
  rows: "rows",
};

export const detailPanelDefaults: DetailPanelLabels = {
  selectPlaceholder: "Select\u2026",
  edit: "Edit",
  cancel: "Cancel",
  save: "Save",
  close: "Close",
  yes: "Yes",
  no: "No",
};

export const userTableDefaults: UserTableLabels = {
  loading: "Loading\u2026",
  searchPlaceholder: "Search users\u2026",
  userTable: "User table",
  selectAllUsers: "Select all users",
  user: "User",
  status: "Status",
  role: "Role",
  teams: "Teams",
  lastActive: "Last active",
  actions: "Actions",
  users: "users",
};

export const sourceCardsDefaults: SourceCardsLabels = {
  noSources: "No sources available.",
  show: "Show",
  more: "more",
};

export const tokenMeterDefaults: TokenMeterLabels = {
  tokenBreakdown: "Token breakdown",
};

export const kpiScorecardDefaults: KpiScorecardLabels = {
  kpiScorecard: "KPI Scorecard",
};

export const avatarDefaults: AvatarLabels = {
  avatar: "Avatar",
};
