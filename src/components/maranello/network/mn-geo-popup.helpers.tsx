"use client";

import { X } from "lucide-react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export const POPUP_SURFACE_CLASS = "relative max-w-xs rounded-md p-3 text-sm";

export function popupSurfaceStyle(): CSSProperties {
  return {
    background: "var(--mn-surface-raised)",
    color: "var(--mn-text)",
    border: "1px solid var(--mn-border)",
    boxShadow: "var(--shadow-card)",
  };
}

export function PopupCloseButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-0.5 right-0.5 z-10 inline-flex size-5 items-center",
        "justify-center rounded-sm transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2",
      )}
      style={{
        color: "var(--mn-text)",
        // @ts-expect-error CSS custom property
        "--tw-ring-color": "var(--mn-focus-ring)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--mn-hover-bg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <X className="size-3.5" aria-hidden />
    </button>
  );
}
