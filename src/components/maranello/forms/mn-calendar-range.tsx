"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DateRange {
  start: string | null;
  end: string | null;
}

interface MnCalendarRangeProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
  startLabel?: string;
  endLabel?: string;
}

/**
 * Date range picker using native date inputs for reliability.
 * Keyboard navigable and screen reader friendly.
 */
function MnCalendarRange({
  value,
  onChange,
  minDate,
  maxDate,
  className,
  startLabel = "Start date",
  endLabel = "End date",
}: MnCalendarRangeProps) {
  const startId = React.useId();
  const endId = React.useId();

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value || null;
    /* If start is after end, reset end */
    const end = start && value.end && start > value.end ? null : value.end;
    onChange({ start, end });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = e.target.value || null;
    /* If end is before start, reset start */
    const start = end && value.start && end < value.start ? null : value.start;
    onChange({ start, end });
  };

  const effectiveMinEnd = value.start ?? minDate;

  return (
    <fieldset className={cn("flex flex-wrap items-end gap-4", className)}>
      <legend className="sr-only">Date range</legend>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={startId}
          className="text-xs font-medium text-muted-foreground"
        >
          {startLabel}
        </label>
        <input
          id={startId}
          type="date"
          value={value.start ?? ""}
          min={minDate}
          max={value.end ?? maxDate}
          onChange={handleStartChange}
          className={cn(
            "rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        />
      </div>
      <span
        aria-hidden="true"
        className="pb-2 text-muted-foreground"
      >
        —
      </span>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={endId}
          className="text-xs font-medium text-muted-foreground"
        >
          {endLabel}
        </label>
        <input
          id={endId}
          type="date"
          value={value.end ?? ""}
          min={effectiveMinEnd}
          max={maxDate}
          onChange={handleEndChange}
          className={cn(
            "rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        />
      </div>
    </fieldset>
  );
}

export { MnCalendarRange };
export type { MnCalendarRangeProps, DateRange };
