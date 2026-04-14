/**
 * MCP tool: analyze_yaml_needs
 *
 * Parses a maranello.yaml (or convergio.yaml) config, extracts all
 * block types used in page definitions, and maps them to the Maranello
 * components needed — including transitive dependencies.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync, existsSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { resolveComponentDeps, BLOCK_TO_COMPONENT } from "./deps";

export function registerAnalyzeTools(server: McpServer): void {
  server.tool(
    "analyze_yaml_needs",
    "Analyze a maranello.yaml config and return which Maranello components are needed",
    {
      yaml_content: z.string().optional().describe("YAML content to analyze (provide this OR file_path)"),
      file_path: z.string().optional().describe("Path to a maranello.yaml or convergio.yaml file"),
    },
    async ({ yaml_content, file_path }) => {
      let content: string;
      if (yaml_content) {
        content = yaml_content;
      } else if (file_path && existsSync(file_path)) {
        content = readFileSync(file_path, "utf-8");
      } else {
        return { content: [{ type: "text" as const, text: "Error: provide yaml_content or a valid file_path" }] };
      }

      let config: Record<string, unknown>;
      try {
        config = parseYaml(content) as Record<string, unknown>;
      } catch (e) {
        return { content: [{ type: "text" as const, text: `YAML parse error: ${(e as Error).message}` }] };
      }

      const blockTypes = extractBlockTypes(config);
      const componentSlugs = blockTypes
        .map((bt) => BLOCK_TO_COMPONENT[bt])
        .filter((s): s is string => !!s);

      const allDeps = resolveComponentDeps(componentSlugs);

      const result = {
        block_types_found: blockTypes,
        components_needed: allDeps,
        install_command: allDeps.length > 0
          ? `npx shadcn add ${allDeps.join(" ")} --registry https://convergio-ui-framework.vercel.app/r`
          : "No Maranello block components needed.",
      };

      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    },
  );
}

/** Recursively extract block type values from a parsed YAML config */
function extractBlockTypes(obj: unknown, types = new Set<string>()): string[] {
  if (Array.isArray(obj)) {
    for (const item of obj) extractBlockTypes(item, types);
  } else if (obj && typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    if (typeof record.type === "string" && record.type.length > 0) {
      types.add(record.type);
    }
    for (const value of Object.values(record)) {
      extractBlockTypes(value, types);
    }
  }
  return [...types].sort();
}
