"use client";

import type { TokenUsage, TaskDistribution } from "@/lib/api";
import { MnChart, MnGauge } from "@/components/maranello";

interface DashboardChartsProps {
  tokenUsage: TokenUsage[] | null;
  taskDist: TaskDistribution[] | null;
}

export function DashboardCharts({ tokenUsage, taskDist }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {Array.isArray(tokenUsage) && tokenUsage.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Token Usage (Daily)
          </h2>
          <MnChart
            type="area"
            labels={tokenUsage.map((t) => t.date)}
            series={[
              {
                label: "Input",
                data: tokenUsage.map((t) => t.input),
                color: "var(--mn-accent)",
              },
              {
                label: "Output",
                data: tokenUsage.map((t) => t.output),
                color: "var(--mn-info)",
              },
            ]}
            showLegend
            animate
          />
        </div>
      )}

      {Array.isArray(taskDist) && taskDist.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Task Distribution
          </h2>
          <MnChart
            type="donut"
            segments={taskDist.map((t) => ({
              label: t.status,
              value: t.count,
            }))}
            showLegend
            animate
          />
        </div>
      )}

      {(!Array.isArray(tokenUsage) || tokenUsage.length === 0) && (!Array.isArray(taskDist) || taskDist.length === 0) && (
        <div className="rounded-lg border border-border bg-card p-6">
          <MnGauge
            value={0}
            max={100}
            label="Awaiting data"
            unit="%"
            size="md"
            animate
          />
        </div>
      )}
    </div>
  );
}
