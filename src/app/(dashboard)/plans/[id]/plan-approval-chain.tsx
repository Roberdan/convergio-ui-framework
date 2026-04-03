"use client";

import type { PlanDetail } from "@/lib/api";
import { MnApprovalChain } from "@/components/maranello";
import type { ApprovalStep, ApprovalStatus } from "@/components/maranello";

interface PlanApprovalChainProps {
  plan: PlanDetail;
}

function deriveApprovalSteps(plan: PlanDetail): ApprovalStep[] {
  const phases: { id: string; name: string; role: string }[] = [
    { id: "create", name: "Plan Created", role: "Author" },
    { id: "review", name: "Review", role: "Reviewer" },
    { id: "execute", name: "Execution", role: "Orchestrator" },
    { id: "validate", name: "Validation", role: "Validator" },
    { id: "complete", name: "Complete", role: "System" },
  ];

  const statusMap: Record<string, number> = {
    pending: 1,
    in_progress: 2,
    completed: 4,
    failed: 2,
    cancelled: 0,
  };

  const progress = statusMap[plan.status] ?? 0;

  return phases.map((phase, i) => {
    let status: ApprovalStatus;

    if (plan.status === "cancelled") {
      status = i === 0 ? "approved" : "skipped";
    } else if (plan.status === "failed" && i >= progress) {
      status = i === progress ? "rejected" : "pending";
    } else if (i < progress) {
      status = "approved";
    } else if (i === progress) {
      status = "current";
    } else {
      status = "pending";
    }

    return {
      id: phase.id,
      name: phase.name,
      role: phase.role,
      status,
      timestamp:
        status === "approved" || status === "rejected"
          ? plan.updatedAt
          : undefined,
    };
  });
}

export function PlanApprovalChain({ plan }: PlanApprovalChainProps) {
  const steps = deriveApprovalSteps(plan);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
        Approval Workflow
      </h2>
      <MnApprovalChain steps={steps} orientation="horizontal" />
    </div>
  );
}
