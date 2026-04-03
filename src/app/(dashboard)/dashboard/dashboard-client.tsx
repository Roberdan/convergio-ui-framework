"use client";

import { useApiQuery } from "@/hooks";
import { dashboardApi } from "@/lib/api";
import type { OverviewStats, BrainData, TokenUsage, TaskDistribution, ModelTokenUsage } from "@/lib/api";
import { DashboardMetrics } from "./dashboard-metrics";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardBrain } from "./dashboard-brain";
import { DashboardActivity } from "./dashboard-activity";
import { DashboardTokenMeters } from "./dashboard-token-meters";
import { DashboardKpi } from "./dashboard-kpi";
import { MnSpinner } from "@/components/maranello";

interface DashboardClientProps {
  initialOverview: OverviewStats | null;
  initialBrain: BrainData | null;
  initialTokenUsage: TokenUsage[] | null;
  initialTaskDist: TaskDistribution[] | null;
  initialModelTokens: ModelTokenUsage[] | null;
}

export function DashboardClient({
  initialOverview,
  initialBrain,
  initialTokenUsage,
  initialTaskDist,
  initialModelTokens,
}: DashboardClientProps) {
  const { data: overview } = useApiQuery(
    () => dashboardApi.getOverview(),
    { pollInterval: 15000 },
  );
  const { data: brain } = useApiQuery(
    () => dashboardApi.getBrainData(),
    { pollInterval: 30000 },
  );
  const { data: tokenUsage } = useApiQuery(
    () => dashboardApi.getTokenUsageDaily(),
    { pollInterval: 60000 },
  );
  const { data: taskDist } = useApiQuery(
    () => dashboardApi.getTaskDistribution(),
    { pollInterval: 30000 },
  );
  const { data: modelTokens } = useApiQuery(
    () => dashboardApi.getTokenUsageByModel(),
    { pollInterval: 60000 },
  );

  const stats = overview ?? initialOverview;
  const brainData = brain ?? initialBrain;
  const tokens = tokenUsage ?? initialTokenUsage;
  const tasks = taskDist ?? initialTaskDist;
  const models = modelTokens ?? initialModelTokens;

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Connecting to daemon..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-caption mt-1">Real-time platform overview</p>
      </div>
      <DashboardMetrics stats={stats} />
      <DashboardTokenMeters tokenUsage={tokens} modelTokens={models} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCharts tokenUsage={tokens} taskDist={tasks} />
        <DashboardBrain data={brainData} />
      </div>
      <DashboardKpi stats={stats} taskDist={tasks} />
      <DashboardActivity stats={stats} />
    </div>
  );
}
