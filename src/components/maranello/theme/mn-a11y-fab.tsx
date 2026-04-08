"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type A11ySettings,
  DEFAULTS,
  FONT_KEYS,
  FONT_LABELS,
  LINE_KEYS,
  LINE_LABELS,
  loadSettings,
  saveSettings,
  applySettings,
} from "./mn-a11y-fab.helpers";

/* ── Toggle switch ── */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm" style={{ color: "var(--mn-text, currentColor)" }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-[22px] w-10 cursor-pointer rounded-full border-none p-0 transition-colors duration-150",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span className={cn(
          "absolute top-0.5 h-[18px] w-[18px] rounded-full bg-background transition-[left] duration-150",
          checked ? "left-5" : "left-0.5",
        )} />
      </button>
    </div>
  );
}

/* ── Segmented button group ── */
function BtnGroup<T extends string>({
  keys,
  labels,
  active,
  onSelect,
}: {
  keys: T[];
  labels: Record<T, string>;
  active: T;
  onSelect: (k: T) => void;
}) {
  return (
    <div className="flex gap-1">
      {keys.map((k) => (
        <button
          type="button"
          key={k}
          onClick={() => onSelect(k)}
          className={cn(
            "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
            active === k
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-transparent hover:bg-accent",
          )}
          style={active !== k ? { color: "var(--mn-text-muted, currentColor)" } : undefined}
        >
          {labels[k]}
        </button>
      ))}
    </div>
  );
}

/** Floating Action Button for accessibility settings. */
function MnA11yFab({
  className,
  position = "fixed",
}: {
  className?: string;
  position?: "fixed" | "inline";
}) {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<A11ySettings>(DEFAULTS);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fabRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    applySettings(s);
  }, []);

  const update = React.useCallback((patch: Partial<A11ySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      applySettings(next);
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    setSettings({ ...DEFAULTS });
    saveSettings({ ...DEFAULTS });
    applySettings({ ...DEFAULTS });
  }, []);

  /* Close on Escape */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); fabRef.current?.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* Close on outside click */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={cn(
        position === "fixed"
          ? "fixed bottom-6 right-6 z-[8500]"
          : "relative z-auto inline-flex",
        className,
      )}
    >
      {/* Panel */}
      <div
        role="dialog"
        aria-label="Accessibility settings"
        className={cn(
          position === "fixed" ? "absolute bottom-16 right-0" : "absolute left-0 top-14",
          "w-[280px] rounded-lg border border-border bg-card p-4 shadow-xl transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--mn-text, currentColor)" }}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Accessibility
        </div>

        {/* Font size */}
        <div className="mb-3">
          <div className="mb-1.5 text-xs uppercase tracking-wider" style={{ color: "var(--mn-text-muted, currentColor)" }}>
            Text Size
          </div>
          <BtnGroup keys={FONT_KEYS} labels={FONT_LABELS} active={settings.fontSize} onSelect={(k) => update({ fontSize: k })} />
        </div>

        {/* Line spacing */}
        <div className="mb-3">
          <div className="mb-1.5 text-xs uppercase tracking-wider" style={{ color: "var(--mn-text-muted, currentColor)" }}>
            Line Spacing
          </div>
          <BtnGroup keys={LINE_KEYS} labels={LINE_LABELS} active={settings.lineSpacing} onSelect={(k) => update({ lineSpacing: k })} />
        </div>

        <hr className="my-2.5 border-border" />

        {/* Toggles */}
        <Toggle label="OpenDyslexic Font" checked={settings.dyslexiaFont} onChange={() => update({ dyslexiaFont: !settings.dyslexiaFont })} />
        <Toggle label="Reduced Motion" checked={settings.reducedMotion} onChange={() => update({ reducedMotion: !settings.reducedMotion })} />
        <Toggle label="High Contrast" checked={settings.highContrast} onChange={() => update({ highContrast: !settings.highContrast })} />
        <Toggle label="Focus Indicators" checked={settings.focusVisible} onChange={() => update({ focusVisible: !settings.focusVisible })} />

        <hr className="my-2.5 border-border" />

        {/* Reset */}
        <button
          type="button"
          onClick={reset}
          className="mt-1 w-full cursor-pointer rounded-md border border-border bg-transparent px-2 py-2 text-xs transition-colors duration-150 hover:bg-accent"
          style={{ color: "var(--mn-text-muted, currentColor)" }}
        >
          Reset to Defaults
        </button>
      </div>

      {/* FAB */}
      <button
        type="button"
        ref={fabRef}
        aria-label="Accessibility settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}

export { MnA11yFab };
export type { A11ySettings as A11yPrefs };
