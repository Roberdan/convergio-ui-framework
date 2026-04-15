/**
 * @convergio/core — main barrel export.
 *
 * Re-exports shell, config, theme, hooks, blocks, block-registry,
 * and page-renderer from the framework source.
 *
 * Consumer usage:
 * ```ts
 * import { AppShell, loadNavSections, PageRenderer } from "@convergio/core";
 * ```
 */

export { AppShell, type AppShellProps } from "../../src/components/shell/app-shell";
export { Sidebar, type NavSection, type NavItem } from "../../src/components/shell/sidebar";
export { Header } from "../../src/components/shell/header";
export { SearchCombobox } from "../../src/components/shell/search-combobox";

export {
  loadAppConfig,
  loadNavSections,
  loadPageConfig,
  loadAIConfig,
  loadPageRoutes,
  loadLocaleOverrides,
} from "../../src/lib/config-loader";

export { ThemeProvider } from "../../src/components/theme/theme-provider";
export { ThemeSwitcher } from "../../src/components/theme/theme-switcher";
export { ThemeScript } from "../../src/components/theme/theme-script";

export { useApiQuery } from "../../src/hooks/use-api-query";
export { useEventSource } from "../../src/hooks/use-event-source";
export { useSSEAdapter } from "../../src/hooks/use-sse-adapter";

export { registerBlock, lazyBlock, getBlock, hasBlock, registeredBlockTypes } from "../../src/lib/block-registry";
export { PageRenderer } from "../../src/components/page-renderer";
