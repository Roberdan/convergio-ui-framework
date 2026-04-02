"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FlipCounterSize = "sm" | "md" | "lg";

interface MnFlipCounterProps {
  /** Numeric value to display. */
  value: number;
  /** Total integer digit slots (pads with leading zeros when padZero is true). */
  digits?: number;
  /** Number of decimal places. */
  decimals?: number;
  /** Pad integer part with leading zeros. */
  padZero?: boolean;
  /** Text rendered before the digits. */
  prefix?: string;
  /** Text rendered after the digits. */
  suffix?: string;
  size?: FlipCounterSize;
  /** Flip transition duration in milliseconds. */
  animationDuration?: number;
  /** Accessible label announced by screen readers. */
  label?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  CVA variants                                                       */
/* ------------------------------------------------------------------ */

const counterVariants = cva("inline-flex items-center gap-px font-mono", {
  variants: {
    size: {
      sm: "text-base gap-0.5",
      md: "text-xl gap-0.5",
      lg: "text-3xl gap-1",
    },
  },
  defaultVariants: { size: "md" },
});

const digitBoxVariants = cva(
  "relative overflow-hidden rounded border border-border bg-card",
  {
    variants: {
      size: {
        sm: "h-7 w-5",
        md: "h-10 w-7",
        lg: "h-14 w-10",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const separatorVariants = cva(
  "inline-flex items-center text-muted-foreground font-semibold select-none",
  {
    variants: {
      size: {
        sm: "text-base px-0.5",
        md: "text-xl px-0.5",
        lg: "text-3xl px-1",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CELL_HEIGHT: Record<FlipCounterSize, number> = {
  sm: 28,
  md: 40,
  lg: 56,
};

const DIGITS_ARRAY = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatValue(
  val: number,
  intDigits: number,
  decimals: number,
  padZero: boolean,
): string {
  const clamped = Math.max(0, val);
  let str = decimals > 0 ? clamped.toFixed(decimals) : String(Math.round(clamped));
  if (padZero) {
    const parts = str.split(".");
    while (parts[0].length < intDigits) parts[0] = "0" + parts[0];
    str = parts.join(".");
  }
  return str;
}

/* ------------------------------------------------------------------ */
/*  FlipDigit — single animated digit cell                             */
/* ------------------------------------------------------------------ */

function FlipDigit({
  digit,
  size,
  durationMs,
}: {
  digit: number;
  size: FlipCounterSize;
  durationMs: number;
}) {
  const h = CELL_HEIGHT[size];

  return (
    <div className={digitBoxVariants({ size })} aria-hidden="true">
      {/* Mid-line divider for split-flap look */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-border/40" />
      <div
        className="flex flex-col items-center will-change-transform"
        style={{
          transform: `translateY(${-(digit * h)}px)`,
          transition: `transform ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {DIGITS_ARRAY.map((d) => (
          <div
            key={d}
            className="flex shrink-0 items-center justify-center tabular-nums font-bold text-card-foreground"
            style={{ height: h, lineHeight: `${h}px` }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MnFlipCounter                                                      */
/* ------------------------------------------------------------------ */

/**
 * Animated flip counter display.
 *
 * Renders each digit independently with a vertical CSS transform
 * transition, producing a mechanical split-flap animation similar
 * to airport departure boards.
 */
function MnFlipCounter({
  value,
  digits = 4,
  decimals = 0,
  padZero = true,
  prefix,
  suffix,
  size = "md",
  animationDuration = 500,
  label,
  className,
}: MnFlipCounterProps) {
  const formatted = formatValue(value, digits, decimals, padZero);
  const prevRef = React.useRef(formatted);

  React.useEffect(() => {
    prevRef.current = formatted;
  }, [formatted]);

  const displayLabel = label ?? `Value: ${value}`;

  return (
    <div
      className={cn(counterVariants({ size }), className)}
      role="status"
      aria-live="polite"
      aria-label={displayLabel}
    >
      {prefix && (
        <span className={separatorVariants({ size })} aria-hidden="true">
          {prefix}
        </span>
      )}

      {Array.from(formatted).map((ch, i) => {
        if (ch === "." || ch === ",") {
          return (
            <span
              key={`sep-${i}`}
              className={separatorVariants({ size })}
              aria-hidden="true"
            >
              {ch}
            </span>
          );
        }

        const d = parseInt(ch, 10);
        return (
          <FlipDigit
            key={`digit-${i}`}
            digit={Number.isNaN(d) ? 0 : d}
            size={size}
            durationMs={animationDuration}
          />
        );
      })}

      {suffix && (
        <span className={separatorVariants({ size })} aria-hidden="true">
          {suffix}
        </span>
      )}

      {/* Screen-reader-only live text for value changes */}
      <span className="sr-only">{formatted}</span>
    </div>
  );
}

export { MnFlipCounter, counterVariants, digitBoxVariants };
export type { MnFlipCounterProps, FlipCounterSize };
