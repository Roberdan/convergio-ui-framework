/**
 * i18n type definitions — Forms, Layout & Navigation namespaces.
 */

/* ── Forms ── */

export interface AsyncSelectLabels {
  loading: string;
  noResults: string;
}

export interface CalendarRangeLabels {
  dateRange: string;
}

export interface DatePickerLabels {
  datePicker: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
}

export interface DateRangePickerLabels {
  dateRangePicker: string;
  previousMonth: string;
  nextMonth: string;
  cancel: string;
  apply: string;
}

export interface FilterPanelLabels {
  filterPlaceholder: string;
  searchPlaceholder: string;
  clear: string;
  clearAll: string;
  filters: string;
  activeFilter: string;
  activeFilters: string;
}

export interface LoginLabels {
  signIn: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  hidePassword: string;
  showPassword: string;
  forgotPassword: string;
  serviceStatus: string;
}

export interface ProfileLabels {
  profileMenu: string;
}

export interface SearchDrawerLabels {
  close: string;
  searchResults: string;
}

export interface VoiceInputLabels {
  stopListening: string;
  processingSpeech: string;
  voiceError: string;
  startVoiceInput: string;
}

/* ── Layout ── */

export interface AdminShellLabels {
  skipToContent: string;
  adminNavigation: string;
}

export interface DashboardRendererLabels {
  loadingWidget: string;
  noData: string;
  retry: string;
}

export interface DashboardLabels {
  loading: string;
  widgetFailed: string;
}

export interface DashboardStripLabels {
  trendingUp: string;
  trendingDown: string;
  stable: string;
  pipeline: string;
  trends: string;
  board: string;
  dashboardMetrics: string;
}

export interface HeaderShellLabels {
  search: string;
  header: string;
}

/* ── Navigation ── */

export interface BreadcrumbLabels {
  breadcrumb: string;
}

export interface CommandPaletteLabels {
  noCommandsFound: string;
}

export interface SectionNavLabels {
  sectionNavigation: string;
}

export interface StepperLabels {
  progress: string;
}
