import { describe, it, expect } from "vitest";
import YAML from "yaml";
import { rawConfigSchema } from "./config-schema";

/**
 * Tests for config-schema Zod validation.
 *
 * Validates that the rawConfigSchema correctly accepts valid
 * convergio.yaml structures and rejects malformed configs.
 */

describe("config-schema validation", () => {
  it("accepts a valid full config", () => {
    const valid = {
      app: {
        name: "Convergio Platform",
        description: "AI orchestration dashboard",
      },
      theme: { default: "navy" },
      ai: {
        defaultAgent: "jervis",
        agents: [
          {
            id: "jervis",
            name: "Jervis",
            description: "Platform orchestrator for operations and monitoring",
            provider: "openai",
            model: "gpt-4o",
            systemPrompt: "You are Jervis, the Convergio platform assistant.",
            apiRoute: "/api/chat",
            maxTokens: 4096,
          },
        ],
      },
      navigation: {
        sections: [
          {
            label: "Overview",
            items: [
              { id: "dashboard", label: "Dashboard", href: "/", icon: "LayoutDashboard" },
            ],
          },
        ],
      },
      pages: {
        "/": {
          title: "Operations Dashboard",
          description: "Real-time platform health and agent activity.",
          rows: [
            {
              columns: 3,
              blocks: [
                { type: "kpi-card", label: "Active Agents", value: "12" },
              ],
            },
          ],
        },
      },
    };

    const result = rawConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.app?.name).toBe("Convergio Platform");
      expect(result.data.theme?.default).toBe("navy");
      expect(result.data.ai?.agents).toHaveLength(1);
      expect(result.data.ai?.agents?.[0].id).toBe("jervis");
      expect(result.data.ai?.agents?.[0].maxTokens).toBe(4096);
      expect(result.data.navigation?.sections).toHaveLength(1);
      expect(result.data.pages?.["/"]).toBeDefined();
      expect(result.data.pages?.["/"].title).toBe("Operations Dashboard");
    }
  });

  it("accepts minimal empty config", () => {
    const result = rawConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.app).toBeUndefined();
      expect(result.data.navigation).toBeUndefined();
      expect(result.data.pages).toBeUndefined();
    }
  });

  it("rejects config with empty app name", () => {
    const result = rawConfigSchema.safeParse({ app: { name: "" } });
    expect(result.success).toBe(false);
  });

  it("rejects config with invalid theme value", () => {
    const result = rawConfigSchema.safeParse({ theme: { default: "neon-pink" } });
    expect(result.success).toBe(false);
  });

  it("rejects config with non-object root", () => {
    const result = rawConfigSchema.safeParse("not-an-object");
    expect(result.success).toBe(false);
  });

  it("rejects agent with missing model field", () => {
    const result = rawConfigSchema.safeParse({
      ai: {
        agents: [{
          id: "broken",
          name: "Broken Agent",
          description: "Missing model",
          provider: "openai",
          systemPrompt: "You are broken.",
        }],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects page with columns out of range", () => {
    const result = rawConfigSchema.safeParse({
      pages: { "/bad": { title: "Bad Page", rows: [{ columns: 0, blocks: [] }] } },
    });
    expect(result.success).toBe(false);
  });

  it("rejects navigation item with empty href", () => {
    const result = rawConfigSchema.safeParse({
      navigation: {
        sections: [{
          label: "Operations",
          items: [{ id: "broken", label: "Broken", href: "", icon: "X" }],
        }],
      },
    });
    expect(result.success).toBe(false);
  });

  it("validates YAML round-trip (parse + validate)", () => {
    const yamlStr = YAML.stringify({
      app: { name: "Convergio Platform" },
      ai: {
        defaultAgent: "jervis",
        agents: [{
          id: "jervis",
          name: "Jervis",
          description: "Platform orchestrator",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt: "You are Jervis.",
        }],
      },
    });

    const parsed: unknown = YAML.parse(yamlStr);
    const result = rawConfigSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });
});
