'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as nightApi from '@/lib/api-night-agents';
import type { NightAgentDef, NightRun, TrackedProject } from '@/types/night-agents';
import type { StripMetric } from '@/components/maranello';
import { MnDashboardStrip, MnStateScaffold, MnBadge } from '@/components/maranello';
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

  const metrics = useMemo<StripMetric[]>(() => {
    const totalAgents = defs?.length ?? 0;
    const activeRuns = runs?.length ?? 0;
    const trackedProjects = projects?.filter((p) => p.enabled).length ?? 0;
    const lastRunTimes = (defs ?? [])
      .map((d) => d.last_run_at)
      .filter(Boolean) as string[];
    const lastRun = lastRunTimes.length > 0
      ? lastRunTimes.sort().reverse()[0]
      : null;
    return [
      { label: 'Total Agents', value: totalAgents },
      { label: 'Active Runs', value: activeRuns },
      { label: 'Tracked Projects', value: trackedProjects },
      { label: 'Last Run', value: formatRelative(lastRun) },
    ];
  }, [defs, runs, projects]);

  if (loading) return <MnStateScaffold state="loading" message="Loading night agents..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetchDefs} />;

  const activeRuns = runs?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Night Agents</h1>
        {activeRuns > 0 && (
          <MnBadge tone="info">{activeRuns} running</MnBadge>
        )}
      </div>

      <MnDashboardStrip metrics={metrics} />

      <AgentDefsTable defs={defs ?? []} />
      <ActiveRunsTable runs={runs ?? []} />
      <TrackedProjectsTable projects={projects ?? []} />
    </div>
  );
}
