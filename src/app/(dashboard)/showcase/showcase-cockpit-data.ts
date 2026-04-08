/**
 * Cockpit showcase data — faithful reproduction of convergio-design cockpit configs.
 */
import type {
  ArcBar, InnerRing, Odometer, StatusLed, Trend, SubDial,
  Crosshair, QuadrantCounts, Multigraph,
  StripMetric,
} from '@/components/maranello';

/* ── Performance dials ─────────────────────────────────────── */

export const PERF_DIALS = [
  { label: 'Routing Throughput', value: 78, max: 100, unit: '%', size: 'md' as const, color: '#FFC72C' },
  { label: 'Accuracy Score', value: 96, max: 100, unit: 'pts', size: 'lg' as const, color: '#00A651' },
  { label: 'Agent Load', value: 61, max: 100, unit: '%', size: 'sm' as const, color: '#4EA8DE' },
] as const;

/* ── KPI Instrument Cluster — primary gauges ───────────────── */

export const utilizationGauge = {
  value: 87, max: 100, color: '#00A651', ticks: 10, subticks: 5,
  startAngle: -225, endAngle: 45, numbers: [0, 20, 40, 60, 80, 100],
  innerRing: { value: 46.4, max: 60, color: '#FFC72C', label: 'FTE' } satisfies InnerRing,
  odometer: { digits: ['4', '6', '.', '4'], highlightLast: true } satisfies Odometer,
  statusLed: { color: '#00A651', label: 'HEALTHY' } satisfies StatusLed,
};

export const qualityScoreGauge = {
  value: 65, max: 100, color: '#FFC72C', ticks: 10, subticks: 5,
  startAngle: -225, endAngle: 45, numbers: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  label: 'QUALITY', centerValue: '65', centerUnit: '/ 100',
  arcBar: {
    value: 408, max: 600,
    colorStops: ['#DC0000', '#FFC72C', '#00A651'],
    labelLeft: '0', labelRight: '600', labelCenter: '408 pts',
  } satisfies ArcBar,
  subDials: [
    { x: -0.28, y: 0.18, value: 72, max: 100, color: '#448AFF', label: '6Q' },
    { x: 0.28, y: 0.18, value: 58, max: 100, color: '#DC0000', label: 'KPI' },
  ] satisfies SubDial[],
  trend: { direction: 'up' as const, delta: '+5', color: '#00A651' } satisfies Trend,
};

export const portfolioMapGauge = {
  value: 0, max: 100, color: '#448AFF', ticks: 0, subticks: 0,
  startAngle: 0, endAngle: 0,
  crosshair: {
    x: 0.35, y: -0.25, dotColor: '#FFC72C', gridColor: '#D4A826',
    labelTop: 'ACTIVE', labelBottom: 'CLOSED', labelLeft: 'LOW', labelRight: 'HIGH',
    title: 'IMPACT',
    scatterDots: [
      { x: 0.55, y: -0.4, color: '#00A651', r: 5 }, { x: 0.7, y: -0.55, color: '#00A651', r: 4 },
      { x: 0.3, y: -0.1, color: '#FFC72C', r: 4 }, { x: 0.15, y: -0.5, color: '#448AFF', r: 3 },
      { x: -0.2, y: -0.3, color: '#448AFF', r: 3 }, { x: 0.6, y: -0.2, color: '#00A651', r: 4 },
      { x: 0.4, y: -0.65, color: '#00A651', r: 5 }, { x: -0.1, y: 0.15, color: '#DC0000', r: 3 },
      { x: 0.25, y: 0.3, color: '#DC0000', r: 3 }, { x: 0.5, y: -0.35, color: '#FFC72C', r: 4 },
      { x: 0.8, y: -0.6, color: '#00A651', r: 6 }, { x: 0.45, y: -0.5, color: '#00A651', r: 4 },
    ],
  } satisfies Crosshair,
  quadrantCounts: { tl: 5, tr: 32, bl: 2, br: 8 } satisfies QuadrantCounts,
  statusLed: { color: '#00A651', label: '47 ENG' } satisfies StatusLed,
};

/* ── Secondary gauges ──────────────────────────────────────── */

export const SECONDARY_GAUGES = [
  {
    label: 'AT RISK', value: 15, max: 100, color: '#DC0000', ticks: 10, subticks: 5,
    startAngle: -225, endAngle: 45, numbers: [0, 25, 50, 75, 100],
    centerValue: '15', centerUnit: '%',
    statusLed: { color: '#DC0000', label: 'ALERT' } satisfies StatusLed,
    trend: { direction: 'up' as const, delta: '+3', color: '#DC0000' } satisfies Trend,
    title: 'Risk Level',
  },
  {
    label: 'DATA', value: 91, max: 100, color: '#00A651', ticks: 10, subticks: 5,
    startAngle: -225, endAngle: 45, numbers: [0, 25, 50, 75, 100],
    centerValue: '91', centerUnit: '%',
    innerRing: { value: 88, max: 100, color: '#448AFF', label: 'PREV' } satisfies InnerRing,
    statusLed: { color: '#00A651', label: 'PASS' } satisfies StatusLed,
    title: 'Data Quality',
  },
  {
    label: 'KPI', value: 72, max: 100, color: '#FFC72C', ticks: 10, subticks: 5,
    startAngle: -225, endAngle: 45, numbers: [0, 25, 50, 75, 100],
    centerValue: '72', centerUnit: '%',
    arcBar: { value: 18, max: 24, colorStops: ['#DC0000', '#FFC72C', '#00A651'], labelCenter: '18/24' } satisfies ArcBar,
    statusLed: { color: '#FFC72C', label: 'WARN' } satisfies StatusLed,
    title: 'KPI Coverage',
  },
  {
    label: 'FY26', value: 0, max: 100, color: '#FFC72C', ticks: 0, subticks: 0,
    startAngle: 0, endAngle: 0, centerValue: '75', centerUnit: 'score',
    multigraph: {
      data: [42, 48, 55, 52, 61, 58, 65, 63, 70, 68, 72, 75],
      color: '#FFC72C', label: 'TREND',
    } satisfies Multigraph,
    trend: { direction: 'up' as const, delta: '+33', color: '#00A651' } satisfies Trend,
    title: 'Quality Trend',
  },
] as const;

/* ── Dashboard Strip zones ─────────────────────────────────── */

export const stripMetricsTop: StripMetric[] = [
  { label: 'OPERATIONS', value: '92', trend: 'up' },
  { label: 'E2E', value: '157d', trend: 'flat' },
  { label: 'LATENCY', value: '340ms', trend: 'down' },
];

export const STRIP_ZONES = [
  { type: 'gauge' as const, label: 'OPS', value: 92, min: 0, max: 100 },
  {
    type: 'pipeline' as const, title: 'PIPELINE & AVG DURATION',
    rows: [
      { label: 'PROSPECT', value: 49, secondary: '47d' },
      { label: 'EXPLORATION', value: 49, secondary: '119d' },
      { label: 'SPRINT', value: 36, secondary: '141d' },
      { label: 'WRAP UP', value: 9, secondary: '181d' },
      { label: 'ON HOLD', value: 13, secondary: '118d' },
      { label: 'COMPLETED', value: 126, secondary: '166d' },
      { label: 'WITHDRAWN', value: 80, secondary: '142d' },
    ],
    footer: { label: 'E2E', value: '157d' },
  },
  {
    type: 'trend' as const, title: '6 MONTH TREND',
    items: [
      { label: 'PROSPECTS', value: 49, data: [32, 28, 35, 42, 38, 49] },
      { label: 'IN FLIGHT', value: 94, data: [60, 68, 72, 78, 85, 94] },
      { label: 'CLOSED', value: 126, data: [80, 90, 95, 105, 118, 126] },
      { label: 'ON HOLD', value: 13, data: [8, 10, 15, 12, 11, 13] },
    ],
  },
  {
    type: 'board' as const, title: 'SECONDARY BOARD',
    stats: [{ label: 'ENGAGEMENTS', value: 368 }, { label: 'FTE', value: 257 }],
  },
  { type: 'gauge' as const, label: 'LATENCY', value: 68, min: 0, max: 100 },
];

/* ── Heatmap (resource utilization) ────────────────────────── */

export const HEATMAP_ROWS = [
  [{ label: 'Mon 6a', value: 3 }, { label: 'Mon 9a', value: 18 }, { label: 'Mon 12p', value: 31 }, { label: 'Mon 3p', value: 28 }, { label: 'Mon 6p', value: 14 }, { label: 'Mon 9p', value: 5 }],
  [{ label: 'Tue 6a', value: 5 }, { label: 'Tue 9a', value: 22 }, { label: 'Tue 12p', value: 38 }, { label: 'Tue 3p', value: 35 }, { label: 'Tue 6p', value: 19 }, { label: 'Tue 9p', value: 7 }],
  [{ label: 'Wed 6a', value: 4 }, { label: 'Wed 9a', value: 25 }, { label: 'Wed 12p', value: 42 }, { label: 'Wed 3p', value: 40 }, { label: 'Wed 6p', value: 21 }, { label: 'Wed 9p', value: 8 }],
  [{ label: 'Thu 6a', value: 6 }, { label: 'Thu 9a', value: 20 }, { label: 'Thu 12p', value: 36 }, { label: 'Thu 3p', value: 33 }, { label: 'Thu 6p', value: 17 }, { label: 'Thu 9p', value: 6 }],
  [{ label: 'Fri 6a', value: 2 }, { label: 'Fri 9a', value: 16 }, { label: 'Fri 12p', value: 29 }, { label: 'Fri 3p', value: 24 }, { label: 'Fri 6p', value: 11 }, { label: 'Fri 9p', value: 3 }],
];

/* ── System Status services ────────────────────────────────── */

export const COCKPIT_SERVICES = [
  { id: 'gw', name: 'Gateway', status: 'operational' as const, uptime: 99.99, latencyMs: 42 },
  { id: 'router', name: 'Model Router', status: 'operational' as const, uptime: 99.95, latencyMs: 88 },
  { id: 'vector', name: 'Vector DB', status: 'degraded' as const, uptime: 98.9, latencyMs: 210 },
  { id: 'cache', name: 'Cache Layer', status: 'operational' as const, uptime: 99.97, latencyMs: 12 },
];

export const COCKPIT_INCIDENTS = [
  { id: 'inc-501', title: 'Vector DB index rebuild — elevated latency', date: 'Today · 15:22', severity: 'degraded' as const },
];
