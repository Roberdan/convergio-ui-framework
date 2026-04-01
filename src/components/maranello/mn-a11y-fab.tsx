"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Accessibility preference keys stored in localStorage. */
const STORAGE_KEY = "mn-a11y-prefs";

interface A11yPrefs {
  fontSize: "normal" | "large" | "xl";
  dyslexicFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

const DEFAULT_PREFS: A11yPrefs = {
  fontSize: "normal",
  dyslexicFont: false,
  highContrast: false,
  reducedMotion: false,
};

function loadPrefs(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: A11yPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/** Apply CSS classes to <html> based on current preferences. */
function applyToDocument(prefs: A11yPrefs) {
  const html = document.documentElement;
  html.classList.remove("mn-font-large", "mn-font-xl");
  if (prefs.fontSize === "large") html.classList.add("mn-font-large");
  if (prefs.fontSize === "xl") html.classList.add("mn-font-xl");

  html.classList.toggle("mn-dyslexic", prefs.dyslexicFont);
  html.classList.toggle("mn-high-contrast", prefs.highContrast);
  html.classList.toggle("mn-reduced-motion", prefs.reducedMotion);
}

const FONT_SIZES: A11yPrefs["fontSize"][] = ["normal", "large", "xl"];

/** Floating Action Button for accessibility settings. */
function MnA11yFab({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<A11yPrefs>(DEFAULT_PREFS);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const loaded = loadPrefs();
    setPrefs(loaded);
    applyToDocument(loaded);
  }, []);

  const update = React.useCallback((patch: Partial<A11yPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      applyToDocument(next);
      return next;
    });
  }, []);

  /* Close on Escape */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* Close on outside click */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const cycleFontSize = () => {
    const idx = FONT_SIZES.indexOf(prefs.fontSize);
    update({ fontSize: FONT_SIZES[(idx + 1) % FONT_SIZES.length] });
  };

  return (
    <div ref={panelRef} className={cn("fixed bottom-6 right-6 z-50", className)}>
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          className="mb-3 w-64 rounded-lg border border-border bg-card p-4 shadow-lg"
        >
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">
            Accessibility
          </h3>
          <div className="flex flex-col gap-3">
            <ToggleRow
              label={`Font size: ${prefs.fontSize}`}
              pressed={prefs.fontSize !== "normal"}
              onToggle={cycleFontSize}
            />
            <ToggleRow
              label="OpenDyslexic font"
              pressed={prefs.dyslexicFont}
              onToggle={() => update({ dyslexicFont: !prefs.dyslexicFont })}
            />
            <ToggleRow
              label="High contrast"
              pressed={prefs.highContrast}
              onToggle={() => update({ highContrast: !prefs.highContrast })}
            />
            <ToggleRow
              label="Reduced motion"
              pressed={prefs.reducedMotion}
              onToggle={() => update({ reducedMotion: !prefs.reducedMotion })}
            />
          </div>
        </div>
      )}
      <button
        aria-label="Accessibility settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AccessibilityIcon />
      </button>
    </div>
  );
}

/** Individual toggle row inside the panel. */
function ToggleRow({
  label,
  pressed,
  onToggle,
}: {
  label: string;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={pressed}
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-card-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-block h-5 w-9 rounded-full transition-colors",
          pressed ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "mt-0.5 block h-4 w-4 rounded-full bg-background transition-transform",
            pressed ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

/** Simple accessibility (universal access) SVG icon. */
function AccessibilityIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="4" r="1.5" />
      <path d="M7 8h10" />
      <path d="M12 8v4" />
      <path d="M9 20l3-8 3 8" />
    </svg>
  );
}

export { MnA11yFab };
export type { A11yPrefs };
