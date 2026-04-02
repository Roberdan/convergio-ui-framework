import { plansApi } from "@/lib/api";
import { PlansListClient } from "./plans-list-client";

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  let plans = null;
  try {
    plans = await plansApi.listPlans();
  } catch {
    // Daemon offline
  }

  return <PlansListClient initialPlans={plans} />;
}
