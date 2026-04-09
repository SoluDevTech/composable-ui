import { z } from "zod";

export const AppConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  wsBaseUrl: z.string().url(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
