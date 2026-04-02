"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, X, Clock, User, SkipForward } from "lucide-react";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "skipped" | "current";
type ApprovalAction = "approve" | "reject" | "skip";

export interface ApprovalStep {
  id: string;
  name: string;
  role?: string;
  status: ApprovalStatus;
  timestamp?: string;
  comment?: string;
}

interface MnApprovalChainProps {
  steps: ApprovalStep[];
  orientation?: "horizontal" | "vertical";
  editable?: boolean;
  onAction?: (step: ApprovalStep, action: ApprovalAction) => void;
  className?: string;
}

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  approved: "Approved",
  rejected: "Rejected",
  skipped: "Skipped",
  current: "Current reviewer",
  pending: "Pending",
};

const avatarVariants = cva(
  "relative flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
  {
    variants: {
      size: { default: "h-10 w-10" },
      status: {
        approved: "bg-primary text-primary-foreground",
        rejected: "bg-destructive text-destructive-foreground",
        skipped: "bg-muted text-muted-foreground",
        current: "border-2 border-primary bg-background text-primary",
        pending: "border border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { size: "default", status: "pending" },
  },
);

const connectorVariants = cva("transition-colors", {
  variants: {
    orientation: {
      horizontal: "mx-1 h-px flex-1 min-w-4",
      vertical: "my-1 w-px flex-1 min-h-4 self-center",
    },
    done: {
      true: "bg-primary",
      false: "bg-border",
    },
  },
  defaultVariants: { orientation: "horizontal", done: false },
});

const actionBtnVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      action: {
        approve: "bg-primary/10 text-primary hover:bg-primary/20",
        reject: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        skip: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
    },
  },
);

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function isComplete(status: ApprovalStatus): boolean {
  return status === "approved" || status === "rejected" || status === "skipped";
}

function StatusIcon({ status }: { status: ApprovalStatus }) {
  const cls = "h-3 w-3";
  switch (status) {
    case "approved": return <Check className={cls} aria-hidden="true" />;
    case "rejected": return <X className={cls} aria-hidden="true" />;
    case "skipped": return <SkipForward className={cls} aria-hidden="true" />;
    case "current": return <Clock className={cls} aria-hidden="true" />;
    case "pending": return <User className={cls} aria-hidden="true" />;
  }
}

const badgeVariants = cva(
  "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background",
  {
    variants: {
      status: {
        approved: "bg-primary text-primary-foreground",
        rejected: "bg-destructive text-destructive-foreground",
        skipped: "bg-muted text-muted-foreground",
        current: "bg-primary text-primary-foreground",
        pending: "bg-border text-muted-foreground",
      },
    },
  },
);

function ApprovalNode({
  step,
  editable,
  onAction,
}: {
  step: ApprovalStep;
  editable: boolean;
  onAction?: MnApprovalChainProps["onAction"];
}) {
  const actions: Array<{ label: string; action: ApprovalAction }> = [
    { label: "Approve", action: "approve" },
    { label: "Reject", action: "reject" },
    { label: "Skip", action: "skip" },
  ];

  return (
    <div
      role="listitem"
      className="flex flex-col items-center gap-1 text-center"
      title={step.comment ?? undefined}
    >
      <div className={avatarVariants({ status: step.status })}>
        {getInitials(step.name)}
        <span
          className={badgeVariants({ status: step.status })}
          aria-label={STATUS_LABELS[step.status]}
        >
          <StatusIcon status={step.status} />
        </span>
      </div>

      <span className={cn(
        "text-xs font-medium",
        step.status === "current" ? "text-primary" : "text-foreground",
      )}>
        {step.name}
      </span>

      {step.role && (
        <span className="text-[0.65rem] text-muted-foreground">{step.role}</span>
      )}

      {step.timestamp && (
        <time className="text-[0.6rem] text-muted-foreground">{step.timestamp}</time>
      )}

      {editable && step.status === "current" && onAction && (
        <div className="mt-1 flex gap-1">
          {actions.map((a) => (
            <button
              key={a.action}
              type="button"
              className={actionBtnVariants({ action: a.action })}
              onClick={() => onAction(step, a.action)}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MnApprovalChain({
  steps,
  orientation = "horizontal",
  editable = false,
  onAction,
  className,
}: MnApprovalChainProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      role="list"
      aria-label="Approval chain"
      className={cn(
        "flex items-center gap-1",
        isVertical && "flex-col",
        className,
      )}
    >
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          {i > 0 && (
            <div
              aria-hidden="true"
              className={connectorVariants({
                orientation,
                done: isComplete(steps[i - 1].status),
              })}
            />
          )}
          <ApprovalNode step={step} editable={editable} onAction={onAction} />
        </React.Fragment>
      ))}
    </div>
  );
}

export { MnApprovalChain };
export type { MnApprovalChainProps };
