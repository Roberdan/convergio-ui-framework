"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useGeoMap } from "./mn-geo-map.helpers";

export function ControlGroup({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-md"
      style={{
        background: "var(--mn-surface-raised)",
        border: "1px solid var(--mn-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </div>
  );
}

export function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
  isLast,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "flex size-8 items-center justify-center transition-colors",
        "first:rounded-t-md last:rounded-b-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
      style={{
        color: "var(--mn-text)",
        borderBottom: isLast ? undefined : "1px solid var(--mn-border)",
        // @ts-expect-error CSS custom property
        "--tw-ring-color": "var(--mn-focus-ring)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--mn-hover-bg)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

export function CompassButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  const { map } = useGeoMap();
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!map || !ref.current) return;
    const svg = ref.current;
    const update = () => {
      svg.style.transform = `rotateX(${map.getPitch()}deg) rotateZ(${-map.getBearing()}deg)`;
    };
    map.on("rotate", update);
    map.on("pitch", update);
    update();
    return () => {
      map.off("rotate", update);
      map.off("pitch", update);
    };
  }, [map]);

  return (
    <ControlButton onClick={onClick} label={label} isLast>
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        className="size-5 transition-transform duration-200"
        style={{ transformStyle: "preserve-3d" }}
        aria-hidden
      >
        <path d="M12 2L16 12H12V2Z" style={{ fill: "var(--mn-error)" }} />
        <path
          d="M12 2L8 12H12V2Z"
          style={{
            fill: "color-mix(in srgb, var(--mn-error) 55%, transparent)",
          }}
        />
        <path
          d="M12 22L16 12H12V22Z"
          style={{
            fill: "color-mix(in srgb, var(--mn-text-muted) 60%, transparent)",
          }}
        />
        <path
          d="M12 22L8 12H12V22Z"
          style={{
            fill: "color-mix(in srgb, var(--mn-text-muted) 30%, transparent)",
          }}
        />
      </svg>
    </ControlButton>
  );
}
