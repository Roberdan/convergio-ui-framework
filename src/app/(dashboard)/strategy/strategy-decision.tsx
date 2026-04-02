"use client";

import { MnDecisionMatrix } from "@/components/maranello";
import type { DecisionCriterion, DecisionOption } from "@/components/maranello";

const criteria: DecisionCriterion[] = [
  { name: "Scalability", weight: 0.3 },
  { name: "Cost Efficiency", weight: 0.25 },
  { name: "Developer Experience", weight: 0.2 },
  { name: "Reliability", weight: 0.15 },
  { name: "Time to Market", weight: 0.1 },
];

const options: DecisionOption[] = [
  { name: "Multi-Cloud Mesh", scores: [9, 5, 7, 8, 4] },
  { name: "Single-Cloud Optimized", scores: [6, 8, 8, 7, 8] },
  { name: "Hybrid Edge/Cloud", scores: [8, 6, 5, 7, 5] },
  { name: "Serverless-First", scores: [7, 9, 6, 6, 9] },
];

export function StrategyDecision() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnDecisionMatrix
        criteria={criteria}
        options={options}
        ariaLabel="Architecture decision matrix"
      />
    </div>
  );
}
