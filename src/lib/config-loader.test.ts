import { describe, it, expect, vi, beforeEach } from "vitest";
import YAML from "yaml";

/**
 * Tests for config-loader functions.
 *
 * Mocks the fs module via vi.doMock to inject controlled YAML
 * content and verify config transformation logic.
 */

function mockFs(yamlContent: string, fileExists: boolean | ((path: string) => boolean) = true) {
  const readFileSync = () => yamlContent;
  const existsSync = typeof fileExists === "function" ? fileExists : () => fileExists;
  const watch = () => ({ close: () => {} });
  vi.doMock("fs", () => ({
    default: { readFileSync, existsSync, watch },
    readFileSync,
    existsSync,
    watch,
  }));
}

describe("config-loader functions", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("loadAppConfig returns defaults when no config file exists", async () => {
    mockFs("", false);

    const { loadAppConfig, loadNavSections, loadAIConfig, loadPageRoutes } =
      await import("./config-loader");
    const config = loadAppConfig();

    expect(config.name).toBe("Convergio Frontend Framework");
    expect(config.defaultTheme).toBe("navy");
    expect(loadNavSections()).toEqual([]);
    expect(loadAIConfig().agents).toEqual([]);
    expect(loadPageRoutes()).toEqual([]);
  });

  it("loadAppConfig returns defaults when app section is missing", async () => {
    mockFs(YAML.stringify({}));

    const { loadAppConfig } = await import("./config-loader");
    const config = loadAppConfig();

    expect(config.name).toBe("Convergio Frontend Framework");
    expect(config.defaultTheme).toBe("navy");
  });

  it("loadAppConfig reads name and theme from config", async () => {
    mockFs(YAML.stringify({
      app: { name: "Convergio Platform", description: "AI orchestration dashboard" },
      theme: { default: "dark" },
    }));

    const { loadAppConfig } = await import("./config-loader");
    const config = loadAppConfig();

    expect(config.name).toBe("Convergio Platform");
    expect(config.description).toBe("AI orchestration dashboard");
    expect(config.defaultTheme).toBe("dark");
  });

  it("loadNavSections maps YAML navigation to typed objects", async () => {
    mockFs(YAML.stringify({
      navigation: {
        sections: [{
          label: "Operations",
          items: [
            { id: "agents", label: "Agents", href: "/agents", icon: "Bot" },
            { id: "security", label: "Security", href: "/security", icon: "Shield", badge: 3 },
          ],
        }],
      },
    }));

    const { loadNavSections } = await import("./config-loader");
    const sections = loadNavSections();

    expect(sections).toHaveLength(1);
    expect(sections[0].label).toBe("Operations");
    expect(sections[0].items).toHaveLength(2);
    expect(sections[0].items[0].iconName).toBe("Bot");
    expect(sections[0].items[1].badge).toBe(3);
  });

  it("loadAIConfig returns agents with all fields mapped", async () => {
    mockFs(YAML.stringify({
      ai: {
        defaultAgent: "nasra",
        agents: [{
          id: "nasra",
          name: "Nasra",
          description: "Research and analysis agent",
          provider: "openai",
          model: "gpt-4o-mini",
          systemPrompt: "You are Nasra, a research assistant.",
          avatar: "/avatars/nasra.png",
          maxTokens: 2048,
        }],
      },
    }));

    const { loadAIConfig } = await import("./config-loader");
    const ai = loadAIConfig();

    expect(ai.defaultAgentId).toBe("nasra");
    expect(ai.agents[0].avatar).toBe("/avatars/nasra.png");
    expect(ai.agents[0].maxTokens).toBe(2048);
  });

  it("loadPageConfig returns page layout for known route", async () => {
    mockFs(YAML.stringify({
      pages: {
        "/analytics": {
          title: "Analytics Overview",
          description: "Platform performance metrics.",
          rows: [
            { columns: 4, blocks: [{ type: "kpi-card", label: "Requests", value: "14,200" }] },
            { columns: 2, blocks: [{ type: "data-table", columns: [{ key: "name", label: "Name" }], rows: [{ name: "Acme Corp" }] }] },
          ],
        },
      },
    }));

    const { loadPageConfig } = await import("./config-loader");
    const page = loadPageConfig("/analytics");

    expect(page).not.toBeNull();
    expect(page!.title).toBe("Analytics Overview");
    expect(page!.rows).toHaveLength(2);
    expect(page!.rows[0].columns).toBe(4);
  });

  it("loadPageConfig returns null for unknown route", async () => {
    mockFs(YAML.stringify({ pages: { "/": { title: "Home", rows: [] } } }));

    const { loadPageConfig } = await import("./config-loader");
    expect(loadPageConfig("/nonexistent")).toBeNull();
  });

  it("loadPageRoutes returns all page paths", async () => {
    mockFs(YAML.stringify({
      pages: {
        "/": { title: "Dashboard", rows: [] },
        "/agents": { title: "Agents", rows: [] },
        "/settings": { title: "Settings", rows: [] },
      },
    }));

    const { loadPageRoutes } = await import("./config-loader");
    const routes = loadPageRoutes();

    expect(routes).toEqual(["/", "/agents", "/settings"]);
  });

  it("prefers maranello.yaml over convergio.yaml when both exist", async () => {
    mockFs(
      YAML.stringify({
        app: { name: "Maranello Design System" },
      }),
      (path: string) => path.includes("maranello.yaml"),
    );

    const { loadAppConfig } = await import("./config-loader");
    const config = loadAppConfig();

    expect(config.name).toBe("Maranello Design System");
  });

  it("throws descriptive error for invalid config file", async () => {
    mockFs(YAML.stringify({ app: { name: "" } }));

    const { loadAppConfig } = await import("./config-loader");
    expect(() => loadAppConfig()).toThrow("Invalid config");
  });
});
