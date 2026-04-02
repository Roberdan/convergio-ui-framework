"use client";

import type { BrainData } from "@/lib/api";
import { MnAugmentedBrain } from "@/components/maranello";

interface DashboardBrainProps {
  data: BrainData | null;
}

export function DashboardBrain({ data }: DashboardBrainProps) {
  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Neural graph unavailable</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
        Neural Graph
      </h2>
      <MnAugmentedBrain
        nodes={data.nodes}
        connections={data.connections}
        ariaLabel="Platform neural graph"
      />
    </div>
  );
}
