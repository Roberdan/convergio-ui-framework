"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ToggleSize = "sm" | "md";

interface MnToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: ToggleSize;
  className?: string;
  id?: string;
}

const TRACK: Record<ToggleSize, string> = {
  sm: "h-5 w-9",
  md: "h-6 w-11",
};

const THUMB: Record<ToggleSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4.5 w-4.5",
};

const TRANSLATE: Record<ToggleSize, string> = {
  sm: "translate-x-4",
  md: "translate-x-5",
};

/**
 * Accessible toggle switch with role="switch" and aria-checked.
 * Uses CSS custom properties for theming.
 */
function MnToggleSwitch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  size = "md",
  className,
  id,
}: MnToggleSwitchProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onCheckedChange(!checked);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        id={switchId}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          TRACK[size],
          checked ? "bg-primary" : "bg-muted",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none block rounded-full bg-background shadow-sm transition-transform",
            THUMB[size],
            checked ? TRANSLATE[size] : "translate-x-0.5",
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={switchId}
          className={cn(
            "text-sm text-foreground select-none",
            disabled && "opacity-50",
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export { MnToggleSwitch };
export type { MnToggleSwitchProps };
