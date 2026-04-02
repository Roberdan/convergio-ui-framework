import { orgsApi } from "@/lib/api";
import { OrgDetailClient } from "./org-detail-client";

export const dynamic = 'force-dynamic';

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let org = null;
  let chart = null;
  let metrics = null;
  let timeline = null;

  try {
    org = await orgsApi.getOrg(id);
    if (org) {
      [chart, metrics, timeline] = await Promise.all([
        orgsApi.getOrgChart(org.slug),
        orgsApi.getOrgMetrics(org.slug),
        orgsApi.getOrgTimeline(org.slug),
      ]);
    }
  } catch {
    // Daemon offline
  }

  return (
    <OrgDetailClient
      orgId={id}
      initialOrg={org}
      initialChart={chart}
      initialMetrics={metrics}
      initialTimeline={timeline}
    />
  );
}
