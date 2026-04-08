"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

const THEMES = ["light", "dark", "navy", "colorblind"] as const;
export type Theme = (typeof THEMES)[number];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: readonly Theme[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const listeners = new Set<() => void>();

function getSnapshot(storageKey: string): string | null {
  try { return localStorage.getItem(storageKey); } catch { return null; }
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  if (theme === "dark" || theme === "navy" || theme === "colorblind") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}

export function ThemeProvider({ children, defaultTheme = "navy", storageKey = "convergio-theme" }: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const stored = useSyncExternalStore(
    subscribe,
    () => getSnapshot(storageKey),
    getServerSnapshot,
  );
  const theme: Theme = (stored && (THEMES as readonly string[]).includes(stored))
    ? (stored as Theme)
    : defaultTheme;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try { localStorage.setItem(storageKey, next); } catch {}
    applyTheme(next);
    notifyListeners();
  }, [storageKey]);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme, setTheme]);

  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
