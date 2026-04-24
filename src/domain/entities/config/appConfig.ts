import { z } from "zod";

export const AppConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  wsBaseUrl: z.string().url(),
  ragApiBaseUrl: z.string().url().or(z.literal("")).optional().default(""),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
