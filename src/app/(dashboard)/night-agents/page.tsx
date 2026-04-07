'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as nightApi from '@/lib/api-night-agents';
import type { NightAgentDef, NightRun, TrackedProject } from '@/types/night-agents';
import { MnStateScaffold } from '@/components/maranello/feedback';
import { MnBadge } from '@/components/maranello/data-display';
import {
  AgentDefsTable,
  ActiveRunsTable,
  TrackedProjectsTable,
} from './night-agents-tables';

const POLL_MS = 5_000;

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'just now';
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function NightAgentsPage() {
  const {
    data: defs,
    loading: defsLoading,
    error: defsError,
    refetch: refetchDefs,
  } = useApiQuery<NightAgentDef[]>(nightApi.nightAgentList, { pollInterval: POLL_MS });

  const {
    data: runs,
    loading: runsLoading,
    error: runsError,
  } = useApiQuery<NightRun[]>(nightApi.nightRunsActive, { pollInterval: POLL_MS });

  const {
    data: projects,
    loading: projLoading,
    error: projError,
  } = useApiQuery<TrackedProject[]>(nightApi.trackedProjectList, { pollInterval: POLL_MS });

  const loading = defsLoading && runsLoading && projLoading;
  const error = defsError || runsError || projError;

  const kpis = useMemo(() => {
    const totalAgents = defs?.length ?? 0;
    const activeRuns = runs?.length ?? 0;
    const trackedProjects = projects?.filter((p) => p.enabled).length ?? 0;
    const lastRunTimes = (defs ?? [])
      .map((d) => d.last_run_at)
      .filter(Boolean) as string[];
    const lastRun = lastRunTimes.length > 0
      ? lastRunTimes.sort().reverse()[0]
      : null;
    return { totalAgents, activeRuns, trackedProjects, lastRun };
  }, [defs, runs, projects]);

  if (loading) return <MnStateScaffold state="loading" message="Loading night agents..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetchDefs} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Night Agents</h1>
        {kpis.activeRuns > 0 && (
          <MnBadge tone="info">{kpis.activeRuns} running</MnBadge>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Agents" value={kpis.totalAgents} />
        <KpiCard label="Active Runs" value={kpis.activeRuns} warn={kpis.activeRuns > 0} />
        <KpiCard label="Tracked Projects" value={kpis.trackedProjects} />
        <KpiCard label="Last Run" value={formatRelative(kpis.lastRun)} />
      </div>

      {/* Agent Definitions */}
      <AgentDefsTable defs={defs ?? []} />

      {/* Active Runs */}
      <ActiveRunsTable runs={runs ?? []} />

      {/* Tracked Projects */}
      <TrackedProjectsTable projects={projects ?? []} />
    </div>
  );
}

function KpiCard({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${warn ? 'text-primary' : ''}`}>{value}</p>
    </div>
  );
}
