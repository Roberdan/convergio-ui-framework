/**
 * i18n type definitions — barrel re-export.
 * Split into domain-specific files for maintainability.
 * All existing `from "./types"` imports continue to work.
 */
export type * from "./types-shell-theme";
export type * from "./types-data";
export type * from "./types-forms-nav";
export type * from "./types-agentic-network";
export type * from "./types-ops-strategy";
export type { LocaleMessages, PartialLocaleMessages } from "./types-umbrella";
