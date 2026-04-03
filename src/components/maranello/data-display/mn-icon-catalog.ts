/**
 * Maranello icon catalog — SVG path data keyed by icon name.
 *
 * Ported from convergio-design icon modules.  All icons use a 24×24 viewBox
 * with stroke-based rendering (`currentColor`).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MnIconEntry {
  /** Inner SVG markup (paths, circles, rects, etc.) */
  d: string
  /** Override stroke-width when it differs from the default 1.5. */
  sw?: number
}

// ---------------------------------------------------------------------------
// Navigation icons
// ---------------------------------------------------------------------------

const nav = {
  dashboard: { d: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' },
  home: { d: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>' },
  menu: { d: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' },
  chevronRight: { d: '<polyline points="9 18 15 12 9 6"/>' },
  chevronDown: { d: '<polyline points="6 9 12 15 18 9"/>' },
  chevronLeft: { d: '<polyline points="15 18 9 12 15 6"/>' },
  chevronUp: { d: '<polyline points="18 15 12 9 6 15"/>' },
  arrowUp: { d: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>' },
  arrowDown: { d: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>' },
  arrowLeft: { d: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>' },
  arrowRight: { d: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>' },
  externalLink: { d: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>' },
  sidebar: { d: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>' },
  panelRight: { d: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>' },
  columns: { d: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>' },
  maximize: { d: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>' },
  minimize: { d: '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>' },
  expand: { d: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>' },
  collapse: { d: '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>' },
  funnel: { d: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>' },
  gantt: { d: '<rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="17" width="15" height="4" rx="1"/>' },
  table: { d: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
  heatmap: { d: '<rect x="2" y="2" width="6" height="6" rx="0.5"/><rect x="9" y="2" width="6" height="6" rx="0.5"/><rect x="16" y="2" width="6" height="6" rx="0.5"/><rect x="2" y="9" width="6" height="6" rx="0.5"/><rect x="9" y="9" width="6" height="6" rx="0.5"/><rect x="16" y="9" width="6" height="6" rx="0.5"/><rect x="2" y="16" width="6" height="6" rx="0.5"/><rect x="9" y="16" width="6" height="6" rx="0.5"/><rect x="16" y="16" width="6" height="6" rx="0.5"/>' },
  grid: { d: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
} satisfies Record<string, MnIconEntry>

// ---------------------------------------------------------------------------
// Status & feedback icons
// ---------------------------------------------------------------------------

const status = {
  checkCircle: { d: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
  alertTriangle: { d: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
  alertCircle: { d: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' },
  info: { d: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' },
  atRisk: { d: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1" fill="currentColor"/>' },
  completed: { d: '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>' },
  blocked: { d: '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>' },
  loader: { d: '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>' },
  shield: { d: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  shieldCheck: { d: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>' },
} satisfies Record<string, MnIconEntry>

// ---------------------------------------------------------------------------
// Action & editing icons
// ---------------------------------------------------------------------------

const actions = {
  refresh: { d: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>' },
  settings: { d: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
  close: { d: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' },
  edit: { d: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
  copy: { d: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' },
  trash: { d: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' },
  download: { d: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' },
  upload: { d: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
  plus: { d: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
  minus: { d: '<line x1="5" y1="12" x2="19" y2="12"/>' },
  filter: { d: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>' },
  sort: { d: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>' },
  search: { d: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
  sliders: { d: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>' },
  eye: { d: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' },
  eyeOff: { d: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>' },
} satisfies Record<string, MnIconEntry>

// ---------------------------------------------------------------------------
// Data visualization & chart icons
// ---------------------------------------------------------------------------

const data = {
  gauge: { d: '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12"/><path d="M12 12l4-8"/><circle cx="12" cy="12" r="2" fill="currentColor"/>' },
  trendUp: { d: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  trendDown: { d: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>' },
  barChart: { d: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  toggleOn: { d: '<rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="4" fill="currentColor"/>' },
  toggleOff: { d: '<rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="8" cy="12" r="4"/>' },
  kpi: { d: '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/><circle cx="12" cy="7" r="2"/><circle cx="18" cy="2" r="1" fill="currentColor"/>' },
  impact: { d: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/>' },
  orgChart: { d: '<rect x="8" y="2" width="8" height="4" rx="1"/><rect x="2" y="18" width="6" height="4" rx="1"/><rect x="9" y="18" width="6" height="4" rx="1"/><rect x="16" y="18" width="6" height="4" rx="1"/><line x1="12" y1="6" x2="12" y2="14"/><line x1="5" y1="14" x2="19" y2="14"/><line x1="5" y1="14" x2="5" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="19" y1="14" x2="19" y2="18"/>' },
  treeView: { d: '<line x1="6" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="10" y2="6"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="6" y1="18" x2="10" y2="18"/><rect x="10" y="3" width="10" height="6" rx="1"/><rect x="10" y="9" width="10" height="6" rx="1"/><rect x="10" y="15" width="10" height="6" rx="1"/>' },
} satisfies Record<string, MnIconEntry>

// ---------------------------------------------------------------------------
// Object, people & misc icons
// ---------------------------------------------------------------------------

const objects = {
  user: { d: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  users: { d: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
  userGroup: { d: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  briefcase: { d: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>' },
  admin: { d: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
  key: { d: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>' },
  lock: { d: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
  unlock: { d: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>' },
  bell: { d: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
  bellDot: { d: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="4" r="3" fill="currentColor" stroke="none"/>' },
  mail: { d: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/>' },
  message: { d: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
  calendar: { d: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  link: { d: '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>' },
  tag: { d: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' },
  star: { d: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  file: { d: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>' },
  folder: { d: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>' },
  image: { d: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>' },
  clock: { d: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>' },
  globe: { d: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
  compass: { d: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.15" stroke="currentColor"/>' },
  bolt: { d: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  zap: { d: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  command: { d: '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>' },
  activity: { d: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  qualityCheck: { d: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>' },
  report: { d: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>' },
  capacity: { d: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="15" r="1" fill="currentColor"/><rect x="12" y="12" width="6" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>' },
  agent: { d: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 15c0 0 1.5 2 3 2s3-2 3-2"/>' },
  accelerator: { d: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  deliverable: { d: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>' },
  layers: { d: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' },
  experiment: { d: '<path d="M9 3h6"/><path d="M10 3v7.4a2 2 0 01-.6 1.4L4 17.2a2 2 0 00-.6 1.4V20a1 1 0 001 1h15.2a1 1 0 001-1v-1.4a2 2 0 00-.6-1.4L14.6 11.8a2 2 0 01-.6-1.4V3"/><circle cx="10" cy="16" r="1" fill="currentColor"/><circle cx="14" cy="18" r="1" fill="currentColor"/>' },
  mic: { d: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0014 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>' },
} satisfies Record<string, MnIconEntry>

// ---------------------------------------------------------------------------
// Platform, hardware & orchestration icons
// ---------------------------------------------------------------------------

const platform = {
  apple: { d: '<path d="M14.2 6.2c.9-1.1 1.3-2.2 1.2-3.2-1.2.1-2.4.8-3.2 1.8-.7.9-1.2 2.1-1.1 3.2 1.2.1 2.3-.6 3.1-1.8z"/><path d="M12.2 8.5c-1.6 0-2.3.8-3.5.8S6.7 8.5 5.5 8.6C3.4 8.8 1.7 10.6 1.7 13c0 1.8.7 3.8 1.8 5.3 1 1.4 2.1 3 3.6 2.9 1.4-.1 1.9-.9 3.6-.9s2.1.9 3.6.9c1.6 0 2.5-1.5 3.5-2.9.8-1.1 1.2-2.2 1.4-2.8-2.7-1-3.1-4.9-.5-6.4-.7-1-1.9-1.6-3.1-1.6-1.5-.1-2.6.9-3.4.9z"/>' },
  windows: { d: '<path d="M3 4.5l8-1v8H3zM13 3.2l8-1.2V11h-8zM3 13h8v8l-8-1zM13 13h8v10l-8-1.2z"/>' },
  linux: { d: '<ellipse cx="12" cy="8" rx="4.5" ry="5.5"/><ellipse cx="12" cy="8.5" rx="2" ry="2.5" fill="currentColor" stroke="none" opacity="0.3"/><circle cx="10.2" cy="7.2" r="0.5" fill="currentColor" stroke="none"/><circle cx="13.8" cy="7.2" r="0.5" fill="currentColor" stroke="none"/><path d="M10.5 9.5q1.5 1 3 0"/><path d="M9 13.5c-2 1-3.5 2.5-3.5 5a1 1 0 001 1h11a1 1 0 001-1c0-2.5-1.5-4-3.5-5"/><ellipse cx="12" cy="15.5" rx="2.5" ry="2" fill="currentColor" stroke="none" opacity="0.15"/><path d="M9.5 13c0 1 .8 2.5 2.5 2.5s2.5-1.5 2.5-2.5"/><path d="M10 19.5l-1 2"/><path d="M14 19.5l1 2"/>', sw: 1.3 },
  android: { d: '<path d="M8 10.5a4 4 0 0 1 8 0V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="M9.2 7.2L7.8 5.6M14.8 7.2l1.4-1.6M6 12v4M18 12v4"/><circle cx="10.3" cy="11.7" r=".4" fill="currentColor" stroke="none"/><circle cx="13.7" cy="11.7" r=".4" fill="currentColor" stroke="none"/>' },
  cpu: { d: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="4" height="4" rx=".6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>' },
  memory: { d: '<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 8v8M11 8v8M15 8v8M19 8v8M5 19v2M9 19v2M13 19v2M17 19v2"/>' },
  disk: { d: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M18 17h.01"/>' },
  network: { d: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 12h8M17.6 7.4l-3.2 3.2M17.6 16.6l-3.2-3.2"/>' },
  wifi: { d: '<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>' },
  bluetooth: { d: '<path d="M8 6l8 6-8 6V6zM8 12l8-6M8 12l8 6"/>' },
  usb: { d: '<path d="M12 3v12M12 3l-2 2M12 3l2 2M12 15l-3 3M12 15l3 3"/><circle cx="9" cy="19" r="1"/><rect x="14.5" y="17.5" width="3" height="3" rx=".5"/><path d="M12 10h5"/>' },
  server: { d: '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01M11 7h7M11 17h7"/>' },
  database: { d: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13"/><path d="M5 10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5M5 14.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>' },
  cloud: { d: '<path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5a3.5 3.5 0 1 1 .8 6.9H7z"/>' },
  cloudSync: { d: '<path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5a3.5 3.5 0 1 1 .8 6.9H7z"/><path d="M9.5 14a2.8 2.8 0 0 1 4.6-1.5M14.5 15.8A2.8 2.8 0 0 1 10 17"/><path d="M14.1 10.9l.2 1.8-1.8.2M9.9 18.1l-.2-1.8 1.8-.2"/>' },
  terminal: { d: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12.5 15H17"/>' },
  code: { d: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>' },
  git: { d: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 6h8M12 8v8"/>' },
  gitPull: { d: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><path d="M8 5h6a4 4 0 0 1 4 4v4M6 7v10M10 13l-4 4-4-4" transform="translate(4 0)"/>' },
  gitMerge: { d: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 5h2a6 6 0 0 1 6 6M8 19h2a6 6 0 0 0 6-6"/>' },
  gitCommit: { d: '<path d="M3 12h6M15 12h6"/><circle cx="12" cy="12" r="3"/>' },
  deploy: { d: '<path d="M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/><path d="M12 9v6"/>' },
  pipeline: { d: '<rect x="3" y="5" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="17" y="15" width="4" height="4" rx="1"/><path d="M7 7h3M14 12h3"/>' },
  docker: { d: '<rect x="5" y="10" width="3" height="3"/><rect x="8" y="10" width="3" height="3"/><rect x="11" y="10" width="3" height="3"/><rect x="8" y="7" width="3" height="3"/><path d="M4 14h12c1.9 0 3.2-.9 4-2.5.3-.5.5-1 .7-1.6-1-.2-1.7-.8-2.2-1.6-.9.5-1.4 1.2-1.6 2.1H4z"/>' },
  brain: { d: '<path d="M9 5a3 3 0 0 0-5 2v1a2.5 2.5 0 0 0 1.5 4.5V14a3 3 0 0 0 3 3h1.2M15 5a3 3 0 0 1 5 2v1a2.5 2.5 0 0 1-1.5 4.5V14a3 3 0 0 1-3 3h-1.2"/><path d="M9.7 8.5a2.3 2.3 0 0 1 4.6 0v7a2.3 2.3 0 0 1-4.6 0z"/>' },
  robot: { d: '<rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 3v4M2 12h3M19 12h3"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/><path d="M9 15h6"/>' },
  sparkle: { d: '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9zM5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9z"/>' },
  wand: { d: '<path d="M4 20L20 4M14 4h2M18 2v2M18 6v2M20 4h2M6 14h2M10 12v2M10 16v2M12 14h2"/>' },
  lightbulb: { d: '<path d="M9 18h6M10 22h4M8.5 14.5a6 6 0 1 1 7 0c-.8.7-1.2 1.6-1.4 2.5h-4.2c-.2-.9-.6-1.8-1.4-2.5z"/>' },
  ideaJar: { d: '<path d="M8 4h8M9 4v2h6V4M7 9h10l-1 10a2 2 0 0 1-2 1H10a2 2 0 0 1-2-1z"/><path d="M10 12l1 .7L12 12l1 .7L14 12M11 15h2"/><path d="M12 8.5v-1M9.5 9.2l-.7-.7M14.5 9.2l.7-.7"/>' },
  nightAgent: { d: '<path d="M14 3a7 7 0 1 0 7 7 6 6 0 0 1-7-7z"/><circle cx="10" cy="15.5" r="2.2"/><path d="M10 11.8v1.2M10 18v1.2M6.9 15.5h1.2M11.9 15.5h1.2M7.8 13.3l.8.8M11.4 16.9l.8.8M7.8 17.7l.8-.8M11.4 14.1l.8-.8"/>' },
  moonClock: { d: '<path d="M14 3a7 7 0 1 0 7 7 6 6 0 0 1-7-7z"/><circle cx="9" cy="16" r="4"/><path d="M9 14v2.5l1.8 1"/>' },
  autopilot: { d: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 10V4M10.3 13l-5.6 2.4M13.7 13l5.6 2.4"/>' },
  delegate: { d: '<path d="M3 11.5L21 3l-8.5 18-2.5-7z"/><path d="M10 14l11-11"/>' },
  start: { d: '<polygon points="8,6 18,12 8,18"/>' },
  pause: { d: '<rect x="7" y="6" width="3" height="12"/><rect x="14" y="6" width="3" height="12"/>' },
  stop: { d: '<rect x="7" y="7" width="10" height="10" rx="1"/>' },
  reset: { d: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/>' },
  cancel: { d: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>' },
  runNow: { d: '<polygon points="5,4 12,8.5 5,13"/><circle cx="15.5" cy="15.5" r="5.5"/><path d="M15.5 13v2.8l1.8 1"/>' },
  fixOn: { d: '<path d="M14.5 5.5a4 4 0 0 0-5.8 4.9L3 16.1V21h4.9l5.8-5.7a4 4 0 0 0 4.9-5.8l-2.6 2.6-2.4-.5-.5-2.4z"/><path d="M13.5 18.5l2 2 5-5"/>' },
  mesh: { d: '<circle cx="6" cy="17" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="18" cy="17" r="2"/><path d="M7.7 15.9l2.6-5.8M13.7 9.9l2.6 5.8M8 17h8"/>' },
  coordinator: { d: '<circle cx="12" cy="13" r="4"/><path d="M12 4l1.3 2.7 3 .4-2.2 2.1.5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.2-2.1 3-.4z"/><path d="M6 20h12"/>' },
  worker: { d: '<circle cx="8" cy="9" r="3"/><path d="M8 6v-2M8 14v-2M5 9H3M13 9h-2M5.9 6.9L4.5 5.5M10.1 11.1l1.4 1.4M5.9 11.1l-1.4 1.4M10.1 6.9l1.4-1.4"/><path d="M12 20h9M12 16h6"/>' },
  sync: { d: '<path d="M20 7h-5V2M4 17h5v5"/><path d="M6.5 8.5A7 7 0 0 1 18 7M17.5 15.5A7 7 0 0 1 6 17"/>' },
  discover: { d: '<circle cx="10" cy="10" r="5"/><path d="M13.5 13.5L20 20"/><circle cx="8" cy="10" r=".6" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r=".6" fill="currentColor" stroke="none"/><circle cx="11.5" cy="12.5" r=".6" fill="currentColor" stroke="none"/><path d="M8.6 9.8l2.8-1.5M8.6 10.2l2.3 2"/>' },
  push: { d: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M4 14v6h16v-6"/>' },
  addPeer: { d: '<circle cx="8" cy="14" r="3"/><circle cx="16" cy="14" r="3"/><path d="M11 14h2M16 5v6M13 8h6"/>' },
  moon: { d: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' },
  sun: { d: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>' },
  contrast: { d: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" stroke="none"/>' },
} satisfies Record<string, MnIconEntry>

// ---------------------------------------------------------------------------
// Aliases (matching convergio-design merge)
// ---------------------------------------------------------------------------

const aliases = {
  fastForward: objects.accelerator,
  shuffle: platform.sync,
  target: objects.compass,
  share: platform.network,
  trendingUp: data.trendUp,
  pieChart: nav.dashboard,
} satisfies Record<string, MnIconEntry>

// ---------------------------------------------------------------------------
// Merged catalog
// ---------------------------------------------------------------------------

export const mnIconCatalog = {
  ...nav,
  ...status,
  ...actions,
  ...data,
  ...objects,
  ...platform,
  ...aliases,
} satisfies Record<string, MnIconEntry>

export type MnIconName = keyof typeof mnIconCatalog
