"use client";

import { useApiQuery } from "@/hooks";
import { operationsApi } from "@/lib/api";
import type { RunDetail } from "@/lib/api";
import { MnDetailPanel, MnBinnacle, MnSpinner } from "@/components/maranello";
import type { DetailSection, BinnacleEntry } from "@/components/maranello";

interface RunDetailPanelProps {
  runId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RunDetailPanel({ runId, open, onOpenChange }: RunDetailPanelProps) {
  const { data, loading } = useApiQuery(
    () => operationsApi.getRun(runId!),
    { pollInterval: 5000, enabled: !!runId && open },
  );

  const run: RunDetail | null = data ?? null;

  const sections: DetailSection[] = run
    ? [
        {
          title: "Overview",
          fields: [
            { key: "id", label: "Run ID", value: run.id, readOnly: true },
            { key: "planId", label: "Plan", value: run.planId, readOnly: true },
            { key: "status", label: "Status", value: run.status, readOnly: true },
            { key: "startedAt", label: "Started", value: run.startedAt, type: "date", readOnly: true },
            { key: "finishedAt", label: "Finished", value: run.finishedAt ?? "—", readOnly: true },
            { key: "duration", label: "Duration (s)", value: run.duration ?? 0, type: "number", readOnly: true },
          ],
        },
        {
          title: "Metrics",
          fields: [
            { key: "totalTasks", label: "Total Tasks", value: run.metrics.totalTasks, type: "number", readOnly: true },
            { key: "completedTasks", label: "Completed", value: run.metrics.completedTasks, type: "number", readOnly: true },
            { key: "failedTasks", label: "Failed", value: run.metrics.failedTasks, type: "number", readOnly: true },
            { key: "avgDuration", label: "Avg Duration (s)", value: run.metrics.avgTaskDuration, type: "number", readOnly: true },
          ],
        },
      ]
    : [];

  const logEntries: BinnacleEntry[] = (run?.logs ?? []).map((l) => ({
    timestamp: l.timestamp,
    severity: l.level === "error" ? "error" as const
      : l.level === "warning" ? "warning" as const
      : "info" as const,
    source: "run",
    message: l.message,
  }));

  return (
    <MnDetailPanel
      open={open}
      onOpenChange={onOpenChange}
      title={run ? `Run ${run.id.slice(0, 8)}` : "Run Detail"}
      sections={sections}
    >
      {loading && !run && (
        <div className="flex justify-center py-4">
          <MnSpinner size="md" label="Loading run details..." />
        </div>
      )}
      {logEntries.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-2">
            Run Log
          </h3>
          <MnBinnacle entries={logEntries} maxVisible={30} ariaLabel="Run log" />
        </div>
      )}
    </MnDetailPanel>
  );
}
