import { z } from "zod";

export const AppConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  wsBaseUrl: z.string().url(),
  ragApiBaseUrl: z.string().url().or(z.literal("")).optional().default(""),
  mcpApiBaseUrl: z.string().url().or(z.literal("")).optional().default(""),
  // Logout (pattern pickpro) : optionnels pour compat config.json existante
  oauth2ProxyUrl: z.string().url().or(z.literal("")).optional().default(""),
  logtoUrl: z.string().url().or(z.literal("")).optional().default(""),
  logtoAppId: z.string().optional().default(""),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
