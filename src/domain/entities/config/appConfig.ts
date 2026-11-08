import { z } from "zod";

const BuiltInMcpServerSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  transport: z.string().optional().default("http"),
});

export const AppConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  wsBaseUrl: z.string().url(),
  ragApiBaseUrl: z.string().url().or(z.literal("")).optional().default(""),
  mcpApiBaseUrl: z.string().url().or(z.literal("")).optional().default(""),
  // Logout (pattern pickpro) : optionnels pour compat config.json existante
  oauth2ProxyUrl: z.string().url().or(z.literal("")).optional().default(""),
  logtoUrl: z.string().url().or(z.literal("")).optional().default(""),
  logtoAppId: z.string().optional().default(""),
  // Serveurs MCP hébergés par raganything lui-même : listés en lecture
  // seule sur la page MCP Registry (permettre de savoir qu'ils existent
  // sans enregistrement ni clé API).
  builtInMcpServers: z.array(BuiltInMcpServerSchema).optional().default([]),
});

export type BuiltInMcpServer = z.infer<typeof BuiltInMcpServerSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
