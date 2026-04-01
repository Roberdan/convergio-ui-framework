import { readFileSync } from "fs";
import { join } from "path";
import YAML from "yaml";
import type { AppConfig, NavSection, PageConfig, PageRow } from "@/types";
import type { AIConfig } from "@/types";

/**
 * Unified configuration loader.
 *
 * Reads `convergio.yaml` from the project root and returns typed config
 * objects for app, navigation, pages, and AI agents.
 *
 * This runs at build time (in server components / generateStaticParams).
 * The YAML is parsed once and cached for the lifetime of the build.
 *
 * To override: set CONVERGIO_CONFIG_PATH env var to a custom path.
 */

interface RawConfig {
  app?: { name?: string; description?: string; logo?: string };
  theme?: { default?: string; storageKey?: string };
  api?: { baseUrl?: string };
  ai?: { defaultAgent?: string; agents?: RawAgent[] };
  navigation?: { sections?: RawNavSection[] };
  pages?: Record<string, RawPage>;
}

interface RawAgent {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  systemPrompt: string;
  apiRoute?: string;
  avatar?: string;
  maxTokens?: number;
}

interface RawNavSection {
  label: string;
  items: { id: string; label: string; href: string; icon: string; badge?: number }[];
}

interface RawPage {
  title: string;
  description?: string;
  rows: { columns: number; blocks: Record<string, unknown>[] }[];
}

let cached: RawConfig | null = null;

function loadRaw(): RawConfig {
  if (cached) return cached;
  const configPath =
    process.env.CONVERGIO_CONFIG_PATH ??
    join(/* turbopackIgnore: true */ process.cwd(), "convergio.yaml");
  const content = readFileSync(configPath, "utf-8");
  cached = YAML.parse(content) as RawConfig;
  return cached;
}

/** Load app config from convergio.yaml */
export function loadAppConfig(): AppConfig {
  const raw = loadRaw();
  return {
    name: raw.app?.name ?? "App",
    description: raw.app?.description,
    logo: raw.app?.logo,
    defaultTheme: (raw.theme?.default as AppConfig["defaultTheme"]) ?? "navy",
  };
}

/** Load navigation sections from convergio.yaml */
export function loadNavSections(): NavSection[] {
  const raw = loadRaw();
  return (raw.navigation?.sections ?? []).map((s) => ({
    label: s.label,
    items: s.items.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      iconName: item.icon,
      badge: item.badge,
    })),
  }));
}

/** Load a page config by route path from convergio.yaml */
export function loadPageConfig(route: string): PageConfig | null {
  const raw = loadRaw();
  const page = raw.pages?.[route];
  if (!page) return null;
  return {
    title: page.title,
    description: page.description,
    rows: page.rows.map((row): PageRow => ({
      columns: row.columns,
      blocks: row.blocks.map((b) => b as unknown as PageRow["blocks"][number]),
    })),
  };
}

/** Load AI config from convergio.yaml */
export function loadAIConfig(): AIConfig {
  const raw = loadRaw();
  return {
    defaultAgentId: raw.ai?.defaultAgent ?? "default",
    agents: (raw.ai?.agents ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      provider: a.provider as "openai" | "anthropic" | "custom",
      model: a.model,
      systemPrompt: a.systemPrompt,
      apiRoute: a.apiRoute,
      avatar: a.avatar,
      maxTokens: a.maxTokens,
    })),
  };
}

/** Load all route paths defined in convergio.yaml pages */
export function loadPageRoutes(): string[] {
  const raw = loadRaw();
  return Object.keys(raw.pages ?? {});
}
