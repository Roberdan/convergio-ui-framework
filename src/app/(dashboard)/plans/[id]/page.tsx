import { plansApi } from "@/lib/api";
import { PlanDetailClient } from "./plan-detail-client";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let plan = null;
  let tree = null;

  try {
    [plan, tree] = await Promise.all([
      plansApi.getPlanContext(id),
      plansApi.getExecutionTree(id),
    ]);
  } catch {
    // Daemon offline
  }

  return <PlanDetailClient planId={id} initialPlan={plan} initialTree={tree} />;
}
