"use client";

import { useApiQuery } from "@/hooks";
import { agentsApi } from "@/lib/api";
import type {
  AgentSummary,
  AgentCatalogEntry,
  AgentSession,
  AgentTree,
  AgentHistoryEntry,
} from "@/lib/api";
import {
  MnSpinner,
  MnTabs,
  MnTabList,
  MnTab,
  MnTabPanel,
  MnDashboardStrip,
} from "@/components/maranello";
import type { StripMetric } from "@/components/maranello";
import { AgentCatalog } from "./agent-catalog";
import { AgentTable } from "./agent-table";
import { AgentHistory } from "./agent-history";
import { AgentBrain } from "./agent-brain";
import { AgentTriage } from "./agent-triage";

interface AgentsClientProps {
  initialAgents: AgentSummary[] | null;
  initialCatalog: AgentCatalogEntry[] | null;
  initialSessions: AgentSession[] | null;
  initialTree: AgentTree | null;
  initialHistory: AgentHistoryEntry[] | null;
}

export function AgentsClient({
  initialAgents,
  initialCatalog,
  initialSessions,
  initialTree,
  initialHistory,
}: AgentsClientProps) {
  const { data: agents } = useApiQuery(
    () => agentsApi.listAgents(),
    { pollInterval: 10000 },
  );
  const { data: catalog } = useApiQuery(
    () => agentsApi.getAgentCatalog(),
    { pollInterval: 30000 },
  );
  const { data: sessions } = useApiQuery(
    () => agentsApi.getActiveSessions(),
    { pollInterval: 10000 },
  );
  const { data: tree } = useApiQuery(
    () => agentsApi.getAgentTree(),
    { pollInterval: 30000 },
  );
  const { data: history } = useApiQuery(
    () => agentsApi.getAgentHistory(),
    { pollInterval: 15000 },
  );

  const agentList = agents ?? initialAgents;
  const catalogList = catalog ?? initialCatalog;
  const sessionList = sessions ?? initialSessions;
  const treeData = tree ?? initialTree;
  const historyList = history ?? initialHistory;

  const activeCount = agentList?.filter((a) => a.status === "active").length ?? 0;
  const idleCount = agentList?.filter((a) => a.status === "idle").length ?? 0;
  const errorCount = agentList?.filter((a) => a.status === "error").length ?? 0;
  const totalTasks = agentList?.reduce((sum, a) => sum + a.taskCount, 0) ?? 0;

  const stripMetrics: StripMetric[] = [
    { label: "Active", value: activeCount, trend: "up" },
    { label: "Idle", value: idleCount, trend: "flat" },
    { label: "Errors", value: errorCount, trend: errorCount > 0 ? "down" : "flat" },
    { label: "Total Tasks", value: totalTasks },
    { label: "Sessions", value: sessionList?.length ?? 0 },
    { label: "Catalog", value: catalogList?.length ?? 0 },
  ];

  if (!agentList) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading agents..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Agents</h1>
        <p className="text-caption mt-1">AI agent catalog, orchestration, and cost tracking</p>
      </div>

      <MnDashboardStrip metrics={stripMetrics} ariaLabel="Agent metrics" />

      <MnTabs defaultValue="catalog">
        <MnTabList>
          <MnTab value="catalog">Catalog ({catalogList?.length ?? 0})</MnTab>
          <MnTab value="active">Active ({activeCount})</MnTab>
          <MnTab value="history">History</MnTab>
          <MnTab value="brain">Brain</MnTab>
          <MnTab value="triage">AI Triage</MnTab>
        </MnTabList>

        <MnTabPanel value="catalog">
          <AgentCatalog catalog={catalogList} />
        </MnTabPanel>

        <MnTabPanel value="active">
          <AgentTable agents={agentList} sessions={sessionList} catalog={catalogList} />
        </MnTabPanel>

        <MnTabPanel value="history">
          <AgentHistory history={historyList} />
        </MnTabPanel>

        <MnTabPanel value="brain">
          <AgentBrain tree={treeData} agents={agentList} />
        </MnTabPanel>

        <MnTabPanel value="triage">
          <AgentTriage />
        </MnTabPanel>
      </MnTabs>
    </div>
  );
}
