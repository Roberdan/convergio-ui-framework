'use client';

import Link from 'next/link';
import {
  MnActivityFeed,
  MnBadge,
  MnBrain3D,
  MnDashboardStrip,
  MnDataTable,
  MnGauge,
  MnInstrumentBinnacle,
  MnSystemStatus,
  MnTab,
  MnTabList,
  MnTabPanel,
  MnTabs,
  type DataTableColumn,
} from '@/components/maranello';
import {
  binnacleEntries,
  brain3DEdges,
  brain3DNodes,
  stripMetrics,
} from './showcase-data';

type PreviewRow = {
  focus: string;
  owner: { name: string; email: string };
  status: string;
  progress: { value: number; max: number; label: string };
};

const columns: DataTableColumn<PreviewRow>[] = [
  { key: 'focus', label: 'Focus', sortable: true },
  { key: 'owner', label: 'Owner', type: 'avatar' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'progress', label: 'Confidence', type: 'progress' },
];

const rows: PreviewRow[] = [
  { focus: 'Board narrative', owner: { name: 'Elena Park', email: 'elena@convergio.ai' }, status: 'on-track', progress: { value: 84, max: 100, label: '84%' } },
  { focus: 'Operator handoff', owner: { name: 'Marco Riva', email: 'marco@convergio.ai' }, status: 'at risk', progress: { value: 61, max: 100, label: '61%' } },
  { focus: 'Release hygiene', owner: { name: 'Priya Shah', email: 'priya@convergio.ai' }, status: 'planned', progress: { value: 42, max: 100, label: '42%' } },
];

const activity = [
  { agent: 'NaSra', action: 'refined', target: 'the KPI narrative for leadership review', timestamp: '2026-04-08T14:11:00.000Z', priority: 'normal' as const },
  { agent: 'Jony', action: 'shipped', target: 'the approvals table with keyboard states', timestamp: '2026-04-08T13:54:00.000Z', priority: 'high' as const },
  { agent: 'Baccio', action: 'flagged', target: 'a contrast regression before release', timestamp: '2026-04-08T13:32:00.000Z', priority: 'critical' as const },
];

const services = [
  { id: 'api', name: 'Control API', status: 'operational' as const, uptime: 99.98, latencyMs: 82 },
  { id: 'agents', name: 'Agent mesh', status: 'operational' as const, uptime: 99.94, latencyMs: 109 },
  { id: 'jobs', name: 'Night runs', status: 'degraded' as const, uptime: 98.7, latencyMs: 241 },
];

const zones = [
  {
    type: 'trend' as const,
    title: 'Signal',
    items: [
      { label: 'Adoption', value: '84%', data: [61, 66, 70, 76, 81, 84] },
      { label: 'Resilience', value: '99.2%', data: [95, 96, 97, 98, 99, 99.2] },
    ],
  },
  {
    type: 'pipeline' as const,
    title: 'Flow',
    rows: [
      { label: 'Queued', value: 27, secondary: 'now' },
      { label: 'Review', value: 11, secondary: 'gated' },
      { label: 'Ship', value: 6, secondary: 'today' },
    ],
    footer: { label: 'Success', value: '98.4%' },
  },
];

function HeroIntro() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border bg-card px-5 py-6 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[10%] top-[-10rem] h-80 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--mn-accent) 24%, transparent) 0%, transparent 72%)' }}
      />
      <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Interactive demo · framework native
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Convergio Frontend Framework · for agentic AI dashboards
            </p>
            <h3 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              <span className="text-primary">Convergio</span> Frontend{' '}
              <span className="text-[color:var(--mn-text-secondary)]">Framework</span>
            </h3>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              The old public demo had the right drama and density. This explorer now restores that
              same cockpit-grade feel using the real framework components, themes, accessibility,
              and seeded product data.
            </p>
          </div>

          <div className="rounded-2xl border-l-4 border-primary bg-background/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              From the agentic manifesto
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              “Intent is human, momentum is agent. Impact must reach every mind and body. We
              design from the edge first: disability, language, connectivity.”
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <MnBadge tone="success">WCAG 2.2 AA</MnBadge>
            <MnBadge tone="info">6 themes</MnBadge>
            <MnBadge tone="neutral">32 web components</MnBadge>
            <MnBadge tone="warning">Seeded demo data</MnBadge>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/showcase/presets" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Open preset gallery
            </Link>
            <Link href="/showcase/agentic" className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
              Explore agentic surfaces
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background/40 p-3"><MnGauge value={100} max={100} size="sm" label="Inclusion" startAngle={-225} endAngle={45} /></div>
            <div className="rounded-xl border bg-background/40 p-3"><MnGauge value={95} max={100} size="sm" label="Performance" startAngle={-225} endAngle={45} /></div>
            <div className="rounded-xl border bg-background/40 p-3"><MnGauge value={90} max={100} size="sm" label="Precision" startAngle={-225} endAngle={45} /></div>
            <div className="rounded-xl border bg-background/40 p-3"><MnGauge value={100} max={100} size="sm" label="Elegance" startAngle={-225} endAngle={45} /></div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Total token spend', '$284k'],
              ['Active agents', '312'],
              ['Tasks completed', '14,560'],
              ['Compute hours', '18,340'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-background/40 p-3">
                <p className="text-lg font-semibold text-primary">{value}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShowcaseSignaturePreview() {
  return (
    <div className="space-y-4">
      <HeroIntro />

      <MnDashboardStrip
        ariaLabel="Framework explorer hero metrics"
        metrics={[
          { label: 'Product surfaces', value: 12, trend: 'up' },
          { label: 'Accessibility score', value: 'AA', trend: 'up' },
          { label: 'Theme variants', value: 6, trend: 'flat' },
          { label: 'Live readiness', value: '98%', trend: 'up' },
        ]}
        zones={zones}
      />

      <MnTabs defaultValue="cockpit" className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 border-b pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Signature explorer</p>
          <h3 className="text-xl font-semibold">Old demo energy, rebuilt inside the real framework</h3>
        </div>

        <MnTabList>
          <MnTab value="cockpit">Cockpit</MnTab>
          <MnTab value="ops">Ops wall</MnTab>
          <MnTab value="agentic">Agent mesh</MnTab>
        </MnTabList>

        <MnTabPanel value="cockpit" className="pt-2">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <MnInstrumentBinnacle entries={binnacleEntries} metrics={stripMetrics.slice(0, 4)} ariaLabel="Operational binnacle preview" />
            <MnDataTable columns={columns} data={rows} compact aria-label="Decision board preview" />
          </div>
        </MnTabPanel>

        <MnTabPanel value="ops" className="pt-2">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <MnSystemStatus
              services={services}
              incidents={[{ id: 'inc-402', title: 'Ingestion queue slowdown in EU region', date: 'Today · 14:05', severity: 'degraded' }]}
              version="v1.1.0"
              environment="production"
            />
            <MnActivityFeed ariaLabel="Launch activity preview" items={activity} refreshInterval={0} />
          </div>
        </MnTabPanel>

        <MnTabPanel value="agentic" className="pt-2">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The dense 3D mesh, orchestration states, and living topology were already part of the
              system. They now sit back in the center of the explorer instead of being buried.
            </p>
            <MnBrain3D nodes={brain3DNodes} edges={brain3DEdges} height={380} size="fluid" ariaLabel="3D agent mesh preview" />
          </div>
        </MnTabPanel>
      </MnTabs>
    </div>
  );
}
