"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerVariant = "primary" | "muted" | "destructive";

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

const COLOR_MAP: Record<SpinnerVariant, string> = {
  primary: "border-primary/30 border-t-primary",
  muted: "border-muted/30 border-t-muted-foreground",
  destructive: "border-destructive/30 border-t-destructive",
};

interface MnSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

/** Animated loading spinner with size and color variants. */
function MnSpinner({
  size = "md",
  variant = "primary",
  label = "Loading",
  className,
}: MnSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <div
        className={cn(
          "animate-spin rounded-full",
          SIZE_MAP[size],
          COLOR_MAP[variant],
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { MnSpinner };
export type { MnSpinnerProps };
