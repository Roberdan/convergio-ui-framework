"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SIZE_CONFIG = {
  sm: { dimension: 32, thickness: 3 },
  md: { dimension: 64, thickness: 5 },
  lg: { dimension: 96, thickness: 7 },
} as const;

type ProgressRingSize = keyof typeof SIZE_CONFIG;

const VARIANT_COLORS: Record<ProgressRingVariant, string> = {
  primary: "var(--mn-accent)",
  muted: "var(--mn-text-muted)",
  success: "var(--mn-success)",
  destructive: "var(--mn-error)",
};

type ProgressRingVariant = "primary" | "muted" | "success" | "destructive";

interface MnProgressRingProps {
  /** Current progress value (clamped between 0 and max). */
  value?: number;
  /** Maximum value representing 100%. */
  max?: number;
  size?: ProgressRingSize;
  variant?: ProgressRingVariant;
  /** Animate from zero on mount and transitions on value change. */
  animate?: boolean;
  /** Accessible label for the progress ring. */
  label?: string;
  className?: string;
}

/** SVG progress ring with configurable size, color, and smooth animation. */
function MnProgressRing({
  value = 0,
  max = 100,
  size = "md",
  variant = "primary",
  animate = true,
  label,
  className,
}: MnProgressRingProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!animate) return;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const { dimension, thickness } = SIZE_CONFIG[size];
  const radius = (dimension - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = circumference * (1 - pct);
  const half = dimension / 2;
  const strokeColor = VARIANT_COLORS[variant];

  // Show empty ring until mounted when animating
  const displayOffset = animate && !mounted ? circumference : offset;
  const percentage = Math.round(pct * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${percentage}% complete`}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="-rotate-90"
      >
        <circle
          cx={half}
          cy={half}
          r={radius}
          fill="none"
          stroke="var(--mn-border-subtle)"
          strokeWidth={thickness}
        />
        <circle
          cx={half}
          cy={half}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={displayOffset}
          strokeLinecap="round"
          className={cn(
            animate &&
              "transition-[stroke-dashoffset] duration-500 ease-[var(--ease-out)]",
          )}
        />
      </svg>
    </div>
  );
}

export { MnProgressRing };
export type { MnProgressRingProps };
