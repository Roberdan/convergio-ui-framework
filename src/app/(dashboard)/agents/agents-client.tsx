"use client";

import { useApiQuery } from "@/hooks";
import { agentsApi } from "@/lib/api";
import type { AgentSummary, AgentCatalogEntry, AgentSession, AgentTree } from "@/lib/api";
import { AgentTable } from "./agent-table";
import { AgentHierarchy } from "./agent-hierarchy";
import { AgentTriage } from "./agent-triage";
import { MnSpinner, MnTabs, MnTabList, MnTab, MnTabPanel } from "@/components/maranello";

interface AgentsClientProps {
  initialAgents: AgentSummary[] | null;
  initialCatalog: AgentCatalogEntry[] | null;
  initialSessions: AgentSession[] | null;
  initialTree: AgentTree | null;
}

export function AgentsClient({
  initialAgents,
  initialCatalog,
  initialSessions,
  initialTree,
}: AgentsClientProps) {
  const { data: agents } = useApiQuery(
    () => agentsApi.listAgents(),
    { pollInterval: 10000 },
  );
  const { data: sessions } = useApiQuery(
    () => agentsApi.getActiveSessions(),
    { pollInterval: 10000 },
  );
  const { data: tree } = useApiQuery(
    () => agentsApi.getAgentTree(),
    { pollInterval: 30000 },
  );

  const agentList = agents ?? initialAgents;
  const sessionList = sessions ?? initialSessions;
  const treeData = tree ?? initialTree;

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
        <p className="text-caption mt-1">Agent orchestration and management</p>
      </div>

      <MnTabs defaultValue="agents">
        <MnTabList>
          <MnTab value="agents">Agents ({agentList.length})</MnTab>
          <MnTab value="sessions">Sessions ({sessionList?.length ?? 0})</MnTab>
          <MnTab value="hierarchy">Hierarchy</MnTab>
          <MnTab value="triage">AI Triage</MnTab>
        </MnTabList>

        <MnTabPanel value="agents">
          <AgentTable agents={agentList} catalog={initialCatalog} />
        </MnTabPanel>

        <MnTabPanel value="sessions">
          <AgentTable
            agents={agentList}
            sessions={sessionList}
            catalog={initialCatalog}
          />
        </MnTabPanel>

        <MnTabPanel value="hierarchy">
          <AgentHierarchy tree={treeData} />
        </MnTabPanel>

        <MnTabPanel value="triage">
          <AgentTriage />
        </MnTabPanel>
      </MnTabs>
    </div>
  );
}
