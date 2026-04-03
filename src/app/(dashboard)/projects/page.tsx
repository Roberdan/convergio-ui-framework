import { workspacesApi } from "@/lib/api";
import { ProjectsClient } from "./projects-client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let workspaces = null;
  let deliverables = null;
  let repositories = null;

  try {
    [workspaces, deliverables, repositories] = await Promise.all([
      workspacesApi.listWorkspaces(),
      workspacesApi.getDeliverables(),
      workspacesApi.listRepositories(),
    ]);
  } catch {
    // Daemon offline — client will poll
  }

  return (
    <ProjectsClient
      initialWorkspaces={workspaces}
      initialDeliverables={deliverables}
      initialRepositories={repositories}
    />
  );
}
