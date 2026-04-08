/** Helpers for MnA11yFab — settings interface, persistence, and DOM application. */

export type FontSize = "sm" | "md" | "lg" | "xl";
export type LineSpacing = "normal" | "relaxed" | "loose";

export interface A11ySettings {
  fontSize: FontSize;
  reducedMotion: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  lineSpacing: LineSpacing;
  dyslexiaFont: boolean;
}

export const STORAGE_KEY = "mn-a11y";

export const DEFAULTS: A11ySettings = {
  fontSize: "md",
  reducedMotion: false,
  highContrast: false,
  focusVisible: true,
  lineSpacing: "normal",
  dyslexiaFont: false,
};

export const FONT_SIZE_PX: Record<FontSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

export const LINE_HEIGHT_VALUES: Record<LineSpacing, string> = {
  normal: "normal",
  relaxed: "1.75",
  loose: "2.0",
};

export const FONT_KEYS: FontSize[] = ["sm", "md", "lg", "xl"];
export const FONT_LABELS: Record<FontSize, string> = {
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
};

export const LINE_KEYS: LineSpacing[] = ["normal", "relaxed", "loose"];
export const LINE_LABELS: Record<LineSpacing, string> = {
  normal: "1×",
  relaxed: "1.5×",
  loose: "2×",
};

let dyslexiaFontLoaded = false;

function setClassState(target: Element, className: string, enabled: boolean) {
  if (enabled) target.classList.add(className);
  else target.classList.remove(className);
}

function ensureDyslexiaFont() {
  if (dyslexiaFontLoaded || typeof document === "undefined") return;
  dyslexiaFontLoaded = true;
  const style = document.createElement("style");
  style.textContent = `@font-face{font-family:'OpenDyslexic';font-weight:400;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/antijingoist/opendyslexic@master/compiled/OpenDyslexic-Regular.woff2') format('woff2')}`;
  document.head.appendChild(style);
}

export function loadSettings(): A11ySettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: A11ySettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function applySettings(s: A11ySettings) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;

  // Font size
  html.style.fontSize = `${FONT_SIZE_PX[s.fontSize] ?? 16}px`;

  // Line spacing
  const lh = LINE_HEIGHT_VALUES[s.lineSpacing] ?? "normal";
  html.style.setProperty("--mn-line-height", lh);
  body.style.lineHeight = lh;

  // Body classes
  setClassState(body, "mn-a11y-reduced-motion", s.reducedMotion);
  setClassState(body, "mn-a11y-high-contrast", s.highContrast);
  setClassState(body, "mn-a11y-dyslexia-font", s.dyslexiaFont);

  // HTML class
  setClassState(html, "mn-no-focus-ring", !s.focusVisible);

  // Load dyslexia font on first use
  if (s.dyslexiaFont) ensureDyslexiaFont();
}
