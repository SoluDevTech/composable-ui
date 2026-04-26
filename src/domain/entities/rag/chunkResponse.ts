import { z } from "zod";

/**
 * Schema Zod pour un chunk retourné par LightRAG.
 * Correspond au modèle backend ChunkResponse.
 */
export const ChunkResponseSchema = z.object({
  reference_id: z.string().nullable().optional(),
  content: z.string(),
  file_path: z.string(),
  chunk_id: z.string(),
});

/**
 * Type TypeScript dérivé du schema Zod.
 */
export type ChunkResponse = z.infer<typeof ChunkResponseSchema>;
