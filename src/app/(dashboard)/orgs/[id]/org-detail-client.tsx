"use client";

import type { OrgDetail, OrgChartData, OrgMetrics, OrgTimelineEvent } from "@/lib/api";
import {
  MnOrgChart,
  MnFinOps,
  MnActivityFeed,
  MnSpinner,
  MnDashboardStrip,
} from "@/components/maranello";
import type { OrgNode, StripMetric } from "@/components/maranello";
import { ArrowLeft } from "lucide-react";

interface OrgDetailClientProps {
  orgId: string;
  initialOrg: OrgDetail | null;
  initialChart: OrgChartData | null;
  initialMetrics: OrgMetrics | null;
  initialTimeline: OrgTimelineEvent[] | null;
}

function chartToOrgNode(data: OrgChartData): OrgNode {
  return {
    name: data.name,
    role: data.role,
    status: data.status,
    children: data.children?.map(chartToOrgNode),
  };
}

export function OrgDetailClient({
  initialOrg,
  initialChart,
  initialMetrics,
  initialTimeline,
}: OrgDetailClientProps) {
  if (!initialOrg) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading organization..." />
      </div>
    );
  }

  const metrics: StripMetric[] = initialMetrics
    ? [
        { label: "Members", value: initialMetrics.totalMembers },
        { label: "Active", value: initialMetrics.activeMembers },
        { label: "Tasks Done", value: initialMetrics.tasksCompleted },
        { label: "Plans", value: initialMetrics.planCount },
        { label: "Tokens", value: initialMetrics.tokenUsage.toLocaleString() },
      ]
    : [];

  const activities = (initialTimeline ?? []).map((e) => ({
    agent: e.actor,
    action: e.type,
    target: e.description,
    timestamp: e.timestamp,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a
          href="/orgs"
          className="rounded-md p-2 hover:bg-muted transition-colors"
          aria-label="Back to organizations"
        >
          <ArrowLeft className="size-5" />
        </a>
        <div>
          <h1>{initialOrg.name}</h1>
          {initialOrg.description && (
            <p className="text-caption mt-1">{initialOrg.description}</p>
          )}
        </div>
      </div>

      {metrics.length > 0 && (
        <MnDashboardStrip metrics={metrics} ariaLabel="Organization metrics" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {initialChart && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
              Org Chart
            </h2>
            <MnOrgChart tree={chartToOrgNode(initialChart)} ariaLabel="Organization chart" />
          </div>
        )}

        {activities.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
              Timeline
            </h2>
            <MnActivityFeed items={activities} ariaLabel="Organization timeline" />
          </div>
        )}
      </div>
    </div>
  );
}
