"use client";

import { useApiQuery } from "@/hooks";
import { plansApi } from "@/lib/api";
import type { TaskEvidence } from "@/lib/api";
import { MnBadge, MnSpinner } from "@/components/maranello";
import { FileText, Image, BarChart3, Terminal, X } from "lucide-react";

interface PlanTaskEvidenceProps {
  taskId: string;
  onClose: () => void;
}

const ICON_MAP: Record<TaskEvidence["type"], typeof FileText> = {
  log: Terminal,
  artifact: FileText,
  screenshot: Image,
  metric: BarChart3,
};

const TONE_MAP: Record<TaskEvidence["type"], "info" | "neutral" | "success" | "warning"> = {
  log: "info",
  artifact: "neutral",
  screenshot: "success",
  metric: "warning",
};

export function PlanTaskEvidence({ taskId, onClose }: PlanTaskEvidenceProps) {
  const { data: evidence, loading } = useApiQuery(
    () => plansApi.getTaskEvidence(taskId),
    { enabled: !!taskId },
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground">
          Task Evidence
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 hover:bg-muted transition-colors"
          aria-label="Close evidence panel"
        >
          <X className="size-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-24">
          <MnSpinner size="sm" label="Loading evidence..." />
        </div>
      )}

      {!loading && (!evidence || evidence.length === 0) && (
        <p className="text-sm text-muted-foreground">
          No evidence available for this task.
        </p>
      )}

      {!loading && evidence && evidence.length > 0 && (
        <div className="space-y-3">
          {evidence.map((item) => {
            const Icon = ICON_MAP[item.type];
            return (
              <div
                key={item.id}
                className="rounded-md border border-border p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.title}</span>
                  <MnBadge
                    label={item.type}
                    tone={TONE_MAP[item.type]}
                  />
                  <time className="ml-auto text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </time>
                </div>
                <pre className="text-xs text-muted-foreground bg-muted/50 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                  {item.content}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
