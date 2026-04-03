import { agentsApi } from "@/lib/api";
import { AgentsClient } from "./agents-client";

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  let agents = null;
  let catalog = null;
  let sessions = null;
  let tree = null;
  let history = null;

  try {
    [agents, catalog, sessions, tree, history] = await Promise.all([
      agentsApi.listAgents(),
      agentsApi.getAgentCatalog(),
      agentsApi.getActiveSessions(),
      agentsApi.getAgentTree(),
      agentsApi.getAgentHistory(),
    ]);
  } catch {
    // Daemon offline
  }

  return (
    <AgentsClient
      initialAgents={agents}
      initialCatalog={catalog}
      initialSessions={sessions}
      initialTree={tree}
      initialHistory={history}
    />
  );
}
