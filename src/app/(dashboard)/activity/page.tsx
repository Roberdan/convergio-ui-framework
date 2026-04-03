import { coordinatorApi } from "@/lib/api";
import { ActivityClient } from "./activity-client";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  let events = null;
  let status = null;

  try {
    [events, status] = await Promise.all([
      coordinatorApi.getCoordinatorEvents(),
      coordinatorApi.getCoordinatorStatus(),
    ]);
  } catch {
    // Daemon offline — client will retry via polling
  }

  return (
    <ActivityClient
      initialEvents={events}
      initialStatus={status}
    />
  );
}
