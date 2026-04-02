import { agentsApi } from "@/lib/api";
import { AgentsClient } from "./agents-client";

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  let agents = null;
  let catalog = null;
  let sessions = null;
  let tree = null;

  try {
    [agents, catalog, sessions, tree] = await Promise.all([
      agentsApi.listAgents(),
      agentsApi.getAgentCatalog(),
      agentsApi.getActiveSessions(),
      agentsApi.getAgentTree(),
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
    />
  );
}
