'use client';

import { useMemo } from 'react';
import { MnSectionCard, MnDataTable, type DataTableColumn } from '@/components/maranello';
import type { NightAgentDef, NightRun, TrackedProject } from '@/types/night-agents';

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function elapsed(startedAt: string | null | undefined): string {
  if (!startedAt) return '—';
  const ms = Date.now() - new Date(startedAt).getTime();
  if (ms < 0) return '—';
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

/* ── Agent Definitions Table ── */

const DEF_COLS: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'schedule', label: 'Schedule', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'enabled', label: 'Enabled' },
  { key: 'last_status', label: 'Last Status' },
  { key: 'last_run_at', label: 'Last Run', sortable: true },
];

function prepAgentDefs(defs: NightAgentDef[]): Record<string, unknown>[] {
  return defs.map((d) => ({
    ...d,
    enabled: d.enabled ? '✓' : '✗',
    last_status: d.last_status ?? '—',
    last_run_at: formatTime(d.last_run_at),
  }));
}

export function AgentDefsTable({ defs }: { defs: NightAgentDef[] }) {
  const rows = useMemo(() => prepAgentDefs(defs), [defs]);
  return (
    <MnSectionCard title="Agent Definitions" badge={defs.length} collapsible defaultOpen>
      <MnDataTable columns={DEF_COLS} data={rows} emptyMessage="No agent definitions" />
    </MnSectionCard>
  );
}

/* ── Active Runs Table ── */

const RUN_COLS: DataTableColumn[] = [
  { key: 'agent_name', label: 'Agent', sortable: true },
  { key: 'status_badge', label: 'Status' },
  { key: 'started_at_fmt', label: 'Started', sortable: true },
  { key: 'duration', label: 'Duration' },
];

function prepRuns(runs: NightRun[]): Record<string, unknown>[] {
  return runs.map((r) => ({
    ...r,
    agent_name: r.agent_name ?? `Agent #${r.agent_def_id}`,
    status_badge: r.status,
    started_at_fmt: formatTime(r.started_at),
    duration: elapsed(r.started_at),
  }));
}

export function ActiveRunsTable({ runs }: { runs: NightRun[] }) {
  const rows = useMemo(() => prepRuns(runs), [runs]);
  return (
    <MnSectionCard title="Active Runs" badge={runs.length} collapsible defaultOpen>
      <MnDataTable columns={RUN_COLS} data={rows} emptyMessage="No active runs" />
    </MnSectionCard>
  );
}

/* ── Tracked Projects Table ── */

const PROJ_COLS: DataTableColumn[] = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'repo_path', label: 'Repository' },
  { key: 'last_scan_at_fmt', label: 'Last Scan', sortable: true },
  { key: 'enabled_label', label: 'Active' },
];

function prepProjects(projects: TrackedProject[]): Record<string, unknown>[] {
  return projects.map((p) => ({
    ...p,
    last_scan_at_fmt: formatTime(p.last_scan_at),
    enabled_label: p.enabled ? '✓' : '✗',
  }));
}

export function TrackedProjectsTable({ projects }: { projects: TrackedProject[] }) {
  const rows = useMemo(() => prepProjects(projects), [projects]);
  return (
    <MnSectionCard title="Tracked Projects" badge={projects.length} collapsible defaultOpen>
      <MnDataTable columns={PROJ_COLS} data={rows} emptyMessage="No tracked projects" />
    </MnSectionCard>
  );
}
