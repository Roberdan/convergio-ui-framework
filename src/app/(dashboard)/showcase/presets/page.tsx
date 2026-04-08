import Link from 'next/link';
import {
  MnActivityFeed,
  MnBadge,
  MnBreadcrumb,
  MnDashboardStrip,
  MnDataTable,
  MnSectionCard,
  MnStateScaffold,
  MnSystemStatus,
  type DataTableColumn,
} from '@/components/maranello';

type WorkspaceRow = {
  initiative: string;
  owner: { name: string; email: string };
  status: string;
  progress: { value: number; max: number; label: string };
};

type BoardRow = { theme: string; owner: string; status: string; nextStep: string };

const WORKSPACE_COLUMNS: DataTableColumn<WorkspaceRow>[] = [
  { key: 'initiative', label: 'Initiative', sortable: true },
  { key: 'owner', label: 'Owner', type: 'avatar' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'progress', label: 'Progress', type: 'progress' },
];

const BOARD_COLUMNS: DataTableColumn<BoardRow>[] = [
  { key: 'theme', label: 'Board theme', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'nextStep', label: 'Next step' },
];

const WORKSPACE_ROWS: WorkspaceRow[] = [
  { initiative: 'Apollo onboarding', owner: { name: 'Mina Shah', email: 'mina@acme.io' }, status: 'active', progress: { value: 76, max: 100, label: '76%' } },
  { initiative: 'Billing close loop', owner: { name: 'Luca Serra', email: 'luca@acme.io' }, status: 'at risk', progress: { value: 58, max: 100, label: '58%' } },
  { initiative: 'Release automation', owner: { name: 'Jane Roe', email: 'jane@acme.io' }, status: 'planned', progress: { value: 24, max: 100, label: '24%' } },
];

const BOARD_ROWS: BoardRow[] = [
  { theme: 'Margin recovery', owner: 'CFO', status: 'on-track', nextStep: 'Approve pricing experiment' },
  { theme: 'Churn reduction', owner: 'COO', status: 'at risk', nextStep: 'Escalate onboarding blockers' },
  { theme: 'Enterprise expansion', owner: 'CRO', status: 'planned', nextStep: 'Confirm Q3 account list' },
];

const ACTIVITY = [
  { agent: 'Sara', action: 'triaged', target: 'design review debt', timestamp: '2026-04-08T11:12:00.000Z', priority: 'high' as const },
  { agent: 'Jony', action: 'merged', target: 'workspace handoff flow', timestamp: '2026-04-08T10:28:00.000Z', priority: 'normal' as const },
  { agent: 'Baccio', action: 'blocked', target: 'a low-contrast empty state', timestamp: '2026-04-08T09:51:00.000Z', priority: 'critical' as const },
] as const;

const SERVICES = [
  { id: 'edge', name: 'Edge API', status: 'operational' as const, uptime: 99.99, latencyMs: 74 },
  { id: 'ingest', name: 'Signal ingest', status: 'degraded' as const, uptime: 98.9, latencyMs: 224 },
  { id: 'notify', name: 'Notifications', status: 'operational' as const, uptime: 99.95, latencyMs: 61 },
] as const;

const PRESETS = [
  { id: 'workspace', title: 'Workspace', file: 'presets/workspace.yaml', summary: 'SaaS workbench for flow, review, and owner accountability.' },
  { id: 'ops', title: 'Ops', file: 'presets/ops.yaml', summary: 'Operational wall for incidents, service health, and escalation.' },
  { id: 'executive', title: 'Executive', file: 'presets/executive.yaml', summary: 'Board-ready cockpit for narrative KPIs and decision hygiene.' },
] as const;

export default function PresetsPage() {
  return (
    <div className="space-y-8 pb-12">
      <section className="space-y-4">
        <Link href="/showcase" className="text-sm text-primary hover:underline">
          ← Back to showcase
        </Link>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Starter presets that look like products</h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            These are intentionally opinionated starting points: one primary object, believable data,
            strong hierarchy, and accessibility baked in from the first screen.
          </p>
          <div className="flex flex-wrap gap-2">
            <MnBadge tone="success">Accessibility-first</MnBadge>
            <MnBadge tone="info">Config-driven</MnBadge>
            <MnBadge tone="neutral">Copy a preset, then customize</MnBadge>
          </div>
        </div>
      </section>

      <MnStateScaffold
        state="partial"
        message="Every preset here enforces keyboard reachability, text+color status cues, readable density, and semantic headings."
      />

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Preset overview">
        {PRESETS.map((preset) => (
          <article key={preset.id} className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {preset.title}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{preset.summary}</p>
            <p className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-xs font-mono">{preset.file}</p>
            <a href={`#${preset.id}`} className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">
              Jump to preview
            </a>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Accessibility contract">
        <MnSectionCard title="Accessibility contract" collapsible={false}>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Use real headings, skip links, and keyboard-focusable controls from the first commit.</li>
            <li>Status always uses text plus color; no “green means good” shortcuts.</li>
            <li>Data density is tuned for readability, not fake-dashboard emptiness.</li>
            <li>Starter configs should survive theme changes and the a11y FAB without breaking.</li>
          </ul>
        </MnSectionCard>
        <MnSectionCard title="How to use them" collapsible={false}>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Copy a preset file to <code className="font-mono">convergio.yaml</code>.</li>
            <li>2. Replace branding, navigation labels, and seed data with your domain terms.</li>
            <li>3. Keep the page composition, state handling, and accessibility defaults intact.</li>
          </ol>
        </MnSectionCard>
      </section>

      <article id="workspace" className="space-y-4" aria-labelledby="workspace-title">
        <header className="space-y-2">
          <h2 id="workspace-title" className="text-2xl font-semibold">Workspace preset</h2>
          <p className="text-sm text-muted-foreground">Best for delivery teams, customer ops, and any list-to-detail workflow where handoff quality matters.</p>
        </header>
        <MnBreadcrumb items={[{ label: 'Convergio' }, { label: 'Workspace' }, { label: 'Apollo migration', current: true }]} />
        <MnDashboardStrip
          metrics={[
            { label: 'Active workstreams', value: 12, trend: 'up' },
            { label: 'Review risk', value: 2, trend: 'flat' },
            { label: 'Median cycle time', value: 2.8, unit: 'd', trend: 'down' },
          ]}
          zones={[{ type: 'trend', title: 'Flow', items: [{ label: 'Shipments', value: '18', data: [8, 9, 10, 12, 15, 18] }] }]}
        />
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <MnSectionCard title="Work ready for review" collapsible={false}>
            <MnDataTable columns={WORKSPACE_COLUMNS} data={WORKSPACE_ROWS} aria-label="Workspace review queue" />
          </MnSectionCard>
          <MnActivityFeed items={[...ACTIVITY]} refreshInterval={0} ariaLabel="Workspace delivery activity" />
        </div>
      </article>

      <article id="ops" className="space-y-4" aria-labelledby="ops-title">
        <header className="space-y-2">
          <h2 id="ops-title" className="text-2xl font-semibold">Ops preset</h2>
          <p className="text-sm text-muted-foreground">Best for command centers, reliability teams, and incident-driven operations with tight response loops.</p>
        </header>
        <MnDashboardStrip
          metrics={[
            { label: 'MTTA', value: 4.2, unit: 'm', trend: 'down' },
            { label: 'Open incidents', value: 3, trend: 'flat' },
            { label: 'Services degraded', value: 1, trend: 'down' },
          ]}
          zones={[{ type: 'board', title: 'Shift', stats: [{ label: 'Coverage', value: 'Full' }, { label: 'Escalations', value: '2' }, { label: 'Deploy freeze', value: 'Off' }] }]}
        />
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <MnSystemStatus
            services={[...SERVICES]}
            incidents={[{ id: 'inc-77', title: 'Ingest backlog building in EU West', date: 'Today · 14:05', severity: 'degraded' }]}
            version="v1.1.0"
            environment="production"
          />
          <MnActivityFeed items={[...ACTIVITY]} refreshInterval={0} ariaLabel="Operations escalation feed" />
        </div>
      </article>

      <article id="executive" className="space-y-4" aria-labelledby="executive-title">
        <header className="space-y-2">
          <h2 id="executive-title" className="text-2xl font-semibold">Executive preset</h2>
          <p className="text-sm text-muted-foreground">Best for weekly leadership review, board prep, and narrative KPI reporting without widget spam.</p>
        </header>
        <MnDashboardStrip
          metrics={[
            { label: 'ARR run-rate', value: '$4.8M', trend: 'up' },
            { label: 'Gross retention', value: '93%', trend: 'up' },
            { label: 'Cash risk', value: 'Low', trend: 'flat' },
          ]}
          zones={[{ type: 'trend', title: 'Narrative trend', items: [{ label: 'Margin', value: '18.4%', data: [11, 12, 14, 15, 17, 18.4] }] }]}
        />
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <MnSectionCard title="Leadership narrative" collapsible={false}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Throughput is improving without adding delivery noise: retention is up,
                margin is expanding, and the only flagged decision this week is onboarding friction.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-background/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue quality</p>
                  <p className="mt-1 text-xl font-semibold">$4.8M</p>
                </div>
                <div className="rounded-lg border bg-background/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Margin</p>
                  <p className="mt-1 text-xl font-semibold">18.4%</p>
                </div>
                <div className="rounded-lg border bg-background/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk posture</p>
                  <p className="mt-1 text-xl font-semibold">Low</p>
                </div>
              </div>
            </div>
          </MnSectionCard>
          <MnSectionCard title="Board priorities" collapsible={false}>
            <MnDataTable columns={BOARD_COLUMNS} data={BOARD_ROWS} aria-label="Executive board priorities" />
          </MnSectionCard>
        </div>
      </article>
    </div>
  );
}
