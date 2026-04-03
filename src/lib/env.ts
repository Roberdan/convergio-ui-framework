import { z } from "zod";

const envSchema = z.object({
  /** App display name — used in metadata and branding. */
  NEXT_PUBLIC_APP_NAME: z.string().default("Convergio"),
  /** Public URL for client-side API calls (optional — falls back to API_URL). */
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  /** Server-side backend URL. Optional — defaults to localhost:8420 for local dev. */
  API_URL: z.string().url().default("http://localhost:8420"),
  /** Shared secret for API authentication (optional). */
  API_SECRET: z.string().optional(),
  /** Node environment — auto-detected by Next.js. */
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  // Prefer the explicit server-side var; fall back to the public one if set.
  API_URL: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL,
  API_SECRET: process.env.API_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});
