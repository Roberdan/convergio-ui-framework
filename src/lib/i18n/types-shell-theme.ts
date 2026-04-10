/**
 * i18n type definitions — Shell & Theme namespaces.
 */

/* ── Shell ── */

export interface ShellLabels {
  skipToContent: string;
  dashboard: string;
  brandFallback: string;
}

export interface HeaderLabels {
  toggleMenu: string;
  breadcrumb: string;
  notifications: string;
}

export interface SearchComboboxLabels {
  placeholder: string;
  searchPlaceholder: string;
  searchResults: string;
  components: string;
  navigation: string;
  categories: string;
  theme: string;
  noResults: string;
  home: string;
  light: string;
  dark: string;
  navy: string;
  colorblind: string;
}

export interface SidebarLabels {
  support: string;
  expandSidebar: string;
  collapseSidebar: string;
  brandFallback: string;
}

/* ── Theme ── */

export interface A11yFabLabels {
  accessibilitySettings: string;
  accessibility: string;
  textSize: string;
  lineSpacing: string;
  dyslexicFont: string;
  reducedMotion: string;
  highContrast: string;
  focusIndicators: string;
  resetToDefaults: string;
  fontSizeLabels: Record<string, string>;
  lineSpacingLabels: Record<string, string>;
}

export interface A11yLabels {
  displaySettings: string;
  accessibilitySettings: string;
  display: string;
  textSize: string;
  reducedMotion: string;
  highContrast: string;
  focusIndicators: string;
  resetToDefaults: string;
}

export interface ThemeToggleLabels {
  light: string;
  dark: string;
  navy: string;
  colorblind: string;
  switchTheme: string;
}

export interface ThemeRotaryLabels {
  themeSelector: string;
}

export interface FerrariControlLabels {
  manettinoSelector: string;
  cruiseLever: string;
  toggleLever: string;
  steppedRotary: string;
  on: string;
  off: string;
}
