/* ── App Config ── */

/**
 * Top-level application configuration.
 * Defines branding, identity and default behavior for the entire frontend.
 */
export interface AppConfig {
  /** Display name shown in sidebar header, browser tab, and login page. */
  name: string;
  /** Path to logo image (relative or absolute URL). Optional. */
  logo?: string;
  /** Short description for meta tags and login page subtitle. */
  description?: string;
  /** Theme applied on first visit before user makes a choice. */
  defaultTheme: "light" | "dark" | "navy" | "colorblind";
}

/* ── Navigation ── */

/** A single navigation link in the sidebar. */
export interface NavItem {
  /** Unique identifier. Used as React key. */
  id: string;
  /** Visible label in the sidebar. */
  label: string;
  /** Route path. Must match a Next.js page under (dashboard)/. */
  href: string;
  /** Lucide icon name resolved at render time via icon-map. */
  iconName: string;
  /** Optional count badge (e.g. unread notifications). */
  badge?: number;
}

/** A group of navigation items with a section label. */
export interface NavSection {
  /** Uppercase section header (e.g. "OVERVIEW", "OPERATIONS"). */
  label: string;
  /** Navigation items in this section. */
  items: NavItem[];
}

/** Full navigation configuration for the sidebar. */
export interface NavConfig {
  sections: NavSection[];
}
