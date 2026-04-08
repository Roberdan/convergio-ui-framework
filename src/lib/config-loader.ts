import { existsSync, readFileSync, watch } from "fs";
import { join } from "path";
import YAML from "yaml";
import type { AppConfig, NavSection, PageConfig, PageRow } from "@/types";
import type { AIConfig } from "@/types";
import { rawConfigSchema, type ValidatedConfig } from "./config-schema";

/**
 * Unified configuration loader.
 *
 * Reads the YAML config from the project root and returns typed config
 * objects for app, navigation, pages, and AI agents.
 *
 * Used at build time (server components / generateStaticParams) and at
 * runtime in layouts and route handlers.
 * The YAML is parsed once and cached for the lifetime of the process.
 * Config is validated against a Zod schema at load time.
 * In dev mode, a file watcher invalidates the cache on changes.
 *
 * Config path resolution (first match wins):
 *   1. MARANELLO_CONFIG_PATH env var
 *   2. CONVERGIO_CONFIG_PATH env var (backward compat)
 *   3. maranello.yaml in project root
 *   4. convergio.yaml in project root (backward compat)
 *
 * If no config file is found the loader returns sensible defaults
 * (app name "Maranello", navy theme, empty navigation/pages/AI).
 *
 * NOTE: `api.baseUrl` is validated but not consumed by the runtime — API URL
 * currently comes from env.ts (API_URL).
 */

const DEFAULTS: ValidatedConfig = Object.freeze({});

let cached: ValidatedConfig | null = null;
let watcherInitialized = false;

function getConfigPath(): string {
  if (process.env.MARANELLO_CONFIG_PATH) return process.env.MARANELLO_CONFIG_PATH;
  if (process.env.CONVERGIO_CONFIG_PATH) return process.env.CONVERGIO_CONFIG_PATH;

  const root = /* turbopackIgnore: true */ process.cwd();
  const maranello = join(root, "maranello.yaml");
  if (existsSync(maranello)) return maranello;

  return join(root, "convergio.yaml");
}

/** In dev mode, watch the config file and invalidate cache on change. */
function initDevWatcher(): void {
  if (watcherInitialized || process.env.NODE_ENV !== "development") return;
  watcherInitialized = true;
  try {
    const configPath = getConfigPath();
    if (!existsSync(configPath)) return;
    watch(configPath, { persistent: false }, (eventType) => {
      if (eventType === "change") {
        cached = null;
      }
    });
  } catch {
    /* fs.watch may not be available in all runtimes */
  }
}

function loadRaw(): ValidatedConfig {
  initDevWatcher();
  if (cached) return cached;
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    cached = DEFAULTS;
    return cached;
  }

  const content = readFileSync(configPath, "utf-8");
  const parsed: unknown = YAML.parse(content);
  const result = rawConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid config:\n${issues}`);
  }
  cached = result.data;
  return cached;
}

/** Load app config from the config file. */
export function loadAppConfig(): AppConfig {
  const raw = loadRaw();
  return {
    name: raw.app?.name ?? "Convergio Frontend Framework",
    description: raw.app?.description,
    logo: raw.app?.logo,
    defaultTheme: (raw.theme?.default as AppConfig["defaultTheme"]) ?? "navy",
    themeStorageKey: raw.theme?.storageKey ?? "convergio-theme",
  };
}

/** Load navigation sections from the config file. */
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

/** Load a page config by route path from the config file. */
export function loadPageConfig(route: string): PageConfig | null {
  const raw = loadRaw();
  const pages = raw.pages;
  if (!pages) return null;
  const page = pages[route] as
    | { title: string; description?: string; rows: { columns: number; blocks: Record<string, unknown>[] }[] }
    | undefined;
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

/** Load AI config from the config file. */
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

/** Load all route paths defined in config pages. */
export function loadPageRoutes(): string[] {
  const raw = loadRaw();
  return Object.keys(raw.pages ?? {});
}
