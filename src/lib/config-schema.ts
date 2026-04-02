import { z } from "zod";
import { blockSchema } from "./config-block-schemas";

/**
 * Zod schemas for convergio.yaml config validation.
 * Used by config-loader.ts to validate parsed YAML at load time.
 */

const agentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  provider: z.string(),
  model: z.string().min(1),
  systemPrompt: z.string(),
  apiRoute: z.string().optional(),
  avatar: z.string().optional(),
  maxTokens: z.number().positive().optional(),
});

const navItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  icon: z.string().min(1),
  badge: z.number().optional(),
});

const navSectionSchema = z.object({
  label: z.string().min(1),
  items: z.array(navItemSchema),
});

const pageRowSchema = z.object({
  columns: z.number().int().min(1).max(12),
  blocks: z.array(blockSchema),
});

const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  rows: z.array(pageRowSchema),
});

export const rawConfigSchema = z.object({
  app: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    logo: z.string().optional(),
  }).optional(),
  theme: z.object({
    default: z.enum(["light", "dark", "navy", "colorblind"]).optional(),
    storageKey: z.string().optional(),
  }).optional(),
  api: z.object({
    baseUrl: z.string().url().optional(),
  }).optional(),
  ai: z.object({
    defaultAgent: z.string().optional(),
    agents: z.array(agentSchema).optional(),
  }).optional(),
  navigation: z.object({
    sections: z.array(navSectionSchema).optional(),
  }).optional(),
  pages: z.record(z.string(), pageSchema).optional(),
});

export type ValidatedConfig = z.infer<typeof rawConfigSchema>;
