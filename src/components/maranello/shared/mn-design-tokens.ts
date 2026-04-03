/** IC-02 — Maranello Design Tokens. Pure utility — no React, no side-effects. */

export type MnThemeId = 'navy' | 'dark' | 'light' | 'colorblind';

export interface MnSemanticColors {
  readonly accent: string; readonly accentHover: string; readonly accentText: string;
  readonly error: string; readonly success: string; readonly warning: string; readonly info: string;
  readonly surface: string; readonly surfaceRaised: string; readonly surfaceSunken: string;
  readonly surfaceInput: string; readonly surfaceHover: string;
  readonly text: string; readonly textMuted: string; readonly textTertiary: string;
  readonly textDisabled: string; readonly textInverse: string;
  readonly border: string; readonly borderSubtle: string; readonly borderStrong: string;
  readonly borderFocus: string; readonly borderError: string;
  readonly hoverBg: string; readonly activeBg: string; readonly focusRing: string;
  readonly errorBg: string; readonly successBg: string; readonly warningBg: string; readonly infoBg: string;
  readonly backdrop: string; readonly scrim: string;
}

export type MnThemeColors = Readonly<Record<MnThemeId, MnSemanticColors>>;

const NAVY_COLORS: MnSemanticColors = {
  accent: '#FFC72C',
  accentHover: '#e6b326',
  accentText: '#111111',
  error: '#DC0000',
  success: '#00A651',
  warning: '#FFC72C',
  info: '#448AFF',
  surface: '#111111',
  surfaceRaised: '#1a1a1a',
  surfaceSunken: '#0a0a0a',
  surfaceInput: '#1a1a1a',
  surfaceHover: 'rgba(255,255,255,0.04)',
  text: '#fafafa',
  textMuted: '#9e9e9e',
  textTertiary: '#c8c8c8',
  textDisabled: '#7a7a7a',
  textInverse: '#000000',
  border: '#2a2a2a',
  borderSubtle: 'rgba(255,255,255,0.07)',
  borderStrong: '#c8c8c8',
  borderFocus: '#FFC72C',
  borderError: '#DC0000',
  hoverBg: 'rgba(255,255,255,0.06)',
  activeBg: 'rgba(255,255,255,0.12)',
  focusRing: '#FFC72C',
  errorBg: 'color-mix(in srgb, #DC0000 16%, transparent)',
  successBg: 'color-mix(in srgb, #00A651 16%, transparent)',
  warningBg: 'color-mix(in srgb, #FFC72C 16%, transparent)',
  infoBg: 'color-mix(in srgb, #448AFF 16%, transparent)',
  backdrop: 'rgba(0,0,0,0.4)',
  scrim: 'rgba(0,0,0,0.72)',
} as const;

const DARK_COLORS: MnSemanticColors = { ...NAVY_COLORS } as const;

const LIGHT_COLORS: MnSemanticColors = {
  accent: '#DC0000',
  accentHover: '#b30000',
  accentText: '#ffffff',
  error: '#DC0000',
  success: '#008844',
  warning: '#d4a000',
  info: '#2b7eb5',
  surface: '#ffffff',
  surfaceRaised: '#faf3e6',
  surfaceSunken: '#e8d5b0',
  surfaceInput: '#ffffff',
  surfaceHover: 'rgba(0,0,0,0.04)',
  text: '#111111',
  textMuted: '#6b6b6b',
  textTertiary: '#5a5550',
  textDisabled: '#7b7469',
  textInverse: '#ffffff',
  border: '#d7c39a',
  borderSubtle: 'rgba(0,0,0,0.08)',
  borderStrong: '#b8ad9a',
  borderFocus: '#DC0000',
  borderError: '#DC0000',
  hoverBg: 'rgba(0,0,0,0.06)',
  activeBg: 'rgba(0,0,0,0.12)',
  focusRing: '#DC0000',
  errorBg: 'color-mix(in srgb, #DC0000 14%, transparent)',
  successBg: 'color-mix(in srgb, #008844 14%, transparent)',
  warningBg: 'color-mix(in srgb, #d4a000 14%, transparent)',
  infoBg: 'color-mix(in srgb, #2b7eb5 14%, transparent)',
  backdrop: 'rgba(0,0,0,0.25)',
  scrim: 'rgba(0,0,0,0.6)',
} as const;

const COLORBLIND_COLORS: MnSemanticColors = {
  accent: '#0072B2',
  accentHover: '#005f94',
  accentText: '#ffffff',
  error: '#C94000',
  success: '#009E73',
  warning: '#E69F00',
  info: '#56B4E9',
  surface: '#111111',
  surfaceRaised: '#1a1a1a',
  surfaceSunken: '#0a0a0a',
  surfaceInput: '#1a1a1a',
  surfaceHover: 'rgba(255,255,255,0.04)',
  text: '#fafafa',
  textMuted: '#9e9e9e',
  textTertiary: '#c8c8c8',
  textDisabled: '#7a7a7a',
  textInverse: '#000000',
  border: '#2a2a2a',
  borderSubtle: 'rgba(255,255,255,0.07)',
  borderStrong: '#c8c8c8',
  borderFocus: '#0072B2',
  borderError: '#D55E00',
  hoverBg: 'rgba(255,255,255,0.06)',
  activeBg: 'rgba(255,255,255,0.12)',
  focusRing: '#0072B2',
  errorBg: 'color-mix(in srgb, #C94000 16%, transparent)',
  successBg: 'color-mix(in srgb, #009E73 16%, transparent)',
  warningBg: 'color-mix(in srgb, #E69F00 16%, transparent)',
  infoBg: 'color-mix(in srgb, #56B4E9 16%, transparent)',
  backdrop: 'rgba(0,0,0,0.4)',
  scrim: 'rgba(0,0,0,0.72)',
} as const;

export const THEME_COLORS: MnThemeColors = {
  navy: NAVY_COLORS,
  dark: DARK_COLORS,
  light: LIGHT_COLORS,
  colorblind: COLORBLIND_COLORS,
} as const;

// ── Spacing ────────────────────────────────────────────────────────

export interface MnSpacingScale {
  readonly xxs: string; readonly xs: string; readonly sm: string;
  readonly md: string; readonly lg: string; readonly xl: string;
  readonly xxl: string; readonly '3xl': string; readonly '4xl': string; readonly '5xl': string;
}

export const SPACING: MnSpacingScale = {
  xxs: '0.125rem', xs: '0.25rem', sm: '0.5rem', md: '1rem',
  lg: '1.5rem', xl: '2rem', xxl: '3rem', '3xl': '4rem', '4xl': '6rem', '5xl': '8rem',
} as const;

// ── Typography ─────────────────────────────────────────────────────

export interface MnFontFamily { readonly display: string; readonly body: string; readonly mono: string }

export const FONT_FAMILY: MnFontFamily = {
  display: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'Barlow Condensed', 'Roboto Condensed', 'DIN Condensed', sans-serif",
} as const;

export interface MnTextSize {
  readonly nano: string; readonly micro: string; readonly small: string; readonly base: string;
  readonly large: string; readonly xl: string; readonly xxl: string;
  readonly h1: string; readonly h2: string; readonly h3: string; readonly hero: string;
}

export const TEXT_SIZE: MnTextSize = {
  nano: '0.625rem', micro: '0.75rem', small: '0.875rem', base: '1rem', large: '1.125rem',
  xl: 'clamp(1.25rem, 2vw, 1.75rem)', xxl: 'clamp(1.75rem, 3vw, 2.5rem)',
  h1: 'clamp(1.75rem, 3vw, 2.5rem)', h2: 'clamp(1.25rem, 2vw, 1.75rem)',
  h3: '1.125rem', hero: 'clamp(2.5rem, 5vw, 4.5rem)',
} as const;

// ── Border radius ──────────────────────────────────────────────────

export interface MnRadius {
  readonly xs: string; readonly sm: string; readonly md: string;
  readonly lg: string; readonly xl: string; readonly full: string;
}

export const RADIUS: MnRadius = {
  xs: '0.1875rem', sm: '0.375rem', md: '0.75rem',
  lg: '1rem', xl: '1.5rem', full: '9999px',
} as const;

// ── Shadows ────────────────────────────────────────────────────────

export interface MnShadow {
  readonly sm: string; readonly md: string; readonly lg: string;
  readonly card: string; readonly elevated: string; readonly deep: string; readonly heavy: string;
}

export const SHADOW: MnShadow = {
  sm: '0 1px 4px rgba(0,0,0,0.06)', md: '0 4px 16px rgba(0,0,0,0.10)',
  lg: '0 8px 32px rgba(0,0,0,0.14)', card: '0 2px 20px rgba(0,0,0,0.08)',
  elevated: '0 8px 40px rgba(0,0,0,0.12)', deep: '0 16px 64px rgba(0,0,0,0.2)',
  heavy: '0 24px 80px rgba(0,0,0,0.5)',
} as const;

// ── Animation / transition ─────────────────────────────────────────

export interface MnDuration { readonly fast: string; readonly sm: string; readonly md: string; readonly lg: string }

export const DURATION: MnDuration = { fast: '120ms', sm: '200ms', md: '400ms', lg: '600ms' } as const;

export interface MnEasing { readonly in: string; readonly out: string; readonly inOut: string }

export const EASING: MnEasing = {
  in: 'cubic-bezier(0.7, 0, 0.84, 0)',
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
} as const;

// ── Z-index ────────────────────────────────────────────────────────

export interface MnZIndex { readonly dropdown: number; readonly tooltip: number; readonly modal: number; readonly toast: number }

export const Z_INDEX: MnZIndex = { dropdown: 1000, tooltip: 1100, modal: 1200, toast: 1300 } as const;
