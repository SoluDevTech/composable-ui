import { z } from "zod";

/**
 * Schema Zod pour un chunk retourné par Classical RAG.
 * Correspond au modèle backend ClassicalChunkResponse.
 */
export const ClassicalChunkResponseSchema = z.object({
  chunk_id: z.string(),
  content: z.string(),
  file_path: z.string(),
  relevance_score: z.number(),
  metadata: z.any().default({}),
  bm25_score: z.number().optional(),
  vector_score: z.number().optional(),
  combined_score: z.number().optional(),
});

/**
 * Type TypeScript dérivé du schema Zod.
 */
export type ClassicalChunkResponse = z.infer<typeof ClassicalChunkResponseSchema>;

/**
 * Schema Zod pour la réponse complète de Classical RAG.
 * Correspond au modèle backend ClassicalQueryResponse.
 */
export const ClassicalQueryResponseSchema = z.object({
  status: z.string(),
  message: z.string().default(""),
  queries: z.array(z.string()).default([]),
  chunks: z.array(ClassicalChunkResponseSchema).default([]),
  mode: z.string().default("vector"),
});

/**
 * Type TypeScript dérivé du schema Zod.
 */
export type ClassicalQueryResponse = z.infer<typeof ClassicalQueryResponseSchema>;
