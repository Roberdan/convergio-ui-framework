"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type StepStatus = "done" | "current" | "pending";

interface Step {
  label: string;
  description?: string;
}

interface MnStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  onChange?: (step: number) => void;
}

function getStatus(index: number, current: number): StepStatus {
  if (index < current) return "done";
  if (index === current) return "current";
  return "pending";
}

/** Horizontal step wizard with labels and current/done/pending states. */
function MnStepper({ steps, currentStep, className, onChange }: MnStepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const status = getStatus(i, currentStep);
          const isLast = i === steps.length - 1;
          return (
            <li
              key={step.label}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <button
                type="button"
                aria-current={status === "current" ? "step" : undefined}
                disabled={status === "pending"}
                onClick={() => onChange?.(i)}
                className="group flex flex-col items-center gap-1 focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
              >
                <StepIndicator index={i} status={status} />
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    status === "current" && "text-primary",
                    status === "done" && "text-foreground",
                    status === "pending" && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[0.65rem] text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </button>
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "mx-2 h-px flex-1 transition-colors",
                    i < currentStep ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepIndicator({
  index,
  status,
}: {
  index: number;
  status: StepStatus;
}) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors";
  if (status === "done") {
    return (
      <span className={cn(base, "bg-primary text-primary-foreground")}>
        <CheckIcon />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span
        className={cn(
          base,
          "border-2 border-primary bg-background text-primary",
        )}
      >
        {index + 1}
      </span>
    );
  }
  return (
    <span className={cn(base, "border border-border bg-muted text-muted-foreground")}>
      {index + 1}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export { MnStepper };
export type { MnStepperProps, Step };
