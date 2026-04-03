import { dashboardApi } from "@/lib/api";
import { DashboardClient } from "./dashboard-client";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let overview = null;
  let brain = null;
  let tokenUsage = null;
  let taskDist = null;
  let modelTokens = null;

  try {
    [overview, brain, tokenUsage, taskDist, modelTokens] = await Promise.all([
      dashboardApi.getOverview(),
      dashboardApi.getBrainData(),
      dashboardApi.getTokenUsageDaily(),
      dashboardApi.getTaskDistribution(),
      dashboardApi.getTokenUsageByModel(),
    ]);
  } catch {
    // Daemon offline — render with nulls, client will poll
  }

  return (
    <DashboardClient
      initialOverview={overview}
      initialBrain={brain}
      initialTokenUsage={tokenUsage}
      initialTaskDist={taskDist}
      initialModelTokens={modelTokens}
    />
  );
}
