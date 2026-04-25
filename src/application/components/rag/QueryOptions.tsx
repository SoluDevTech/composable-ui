import { useState } from "react";
import type { QueryMode, ClassicalQueryMode } from "@/domain/entities/rag/queryRequest";

interface QueryOptionsProps {
  pipeline: "lightrag" | "classical";
  mode: string;
  topK: number;
  numVariations?: number;
  relevanceThreshold?: number;
  enableLlmJudge?: boolean;
  onModeChange: (mode: string) => void;
  onTopKChange: (topK: number) => void;
  onNumVariationsChange?: (val: number) => void;
  onRelevanceThresholdChange?: (val: number) => void;
  onEnableLlmJudgeChange?: (val: boolean) => void;
}

const LIGHTRAG_MODES: { value: QueryMode; label: string }[] = [
  { value: "naive", label: "Naive" },
  { value: "local", label: "Local" },
  { value: "global", label: "Global" },
  { value: "hybrid", label: "Hybrid" },
  { value: "hybrid+", label: "Hybrid+" },
  { value: "mix", label: "Mix" },
  { value: "bm25", label: "BM25" },
  { value: "bypass", label: "Bypass" },
];

const CLASSICAL_MODES: { value: ClassicalQueryMode; label: string }[] = [
  { value: "vector", label: "Vector" },
  { value: "hybrid", label: "Hybrid" },
];

export default function QueryOptions({
  pipeline,
  mode,
  topK,
  numVariations,
  relevanceThreshold,
  enableLlmJudge,
  onModeChange,
  onTopKChange,
  onNumVariationsChange,
  onRelevanceThresholdChange,
  onEnableLlmJudgeChange,
}: Readonly<QueryOptionsProps>) {
  const [expanded, setExpanded] = useState(false);

  const modes = pipeline === "lightrag" ? LIGHTRAG_MODES : CLASSICAL_MODES;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-on-surface-variant font-headline text-sm hover:text-on-surface transition-colors"
      >
        <span
          className="material-symbols-outlined text-base"
          aria-hidden="true"
        >
          {expanded ? "expand_less" : "expand_more"}
        </span>
        {"Advanced Options"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-4 pl-6">
          <div className="flex items-center gap-4">
            <label htmlFor="query-mode" className="font-headline text-sm text-on-surface-variant w-28">
              Mode
            </label>
            <select
              id="query-mode"
              value={mode}
              onChange={(e) => onModeChange(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-brand"
            >
              {modes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="query-topk" className="font-headline text-sm text-on-surface-variant w-28">
              Top K
            </label>
            <input
              id="query-topk"
              type="number"
              min={1}
              max={100}
              value={topK}
              onChange={(e) => onTopKChange(Number(e.target.value))}
              className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 font-body text-sm text-on-surface w-24 focus:outline-none focus:ring-2 focus:ring-secondary-brand"
            />
          </div>

          {pipeline === "classical" && (
            <>
              <div className="flex items-center gap-4">
                <label htmlFor="query-variations" className="font-headline text-sm text-on-surface-variant w-28">
                  Variations
                </label>
                <input
                  id="query-variations"
                  type="number"
                  min={1}
                  max={10}
                  value={numVariations ?? 3}
                  onChange={(e) => onNumVariationsChange?.(Number(e.target.value))}
                  className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 font-body text-sm text-on-surface w-24 focus:outline-none focus:ring-2 focus:ring-secondary-brand"
                />
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="query-threshold" className="font-headline text-sm text-on-surface-variant w-28">
                  Threshold
                </label>
                <input
                  id="query-threshold"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={relevanceThreshold ?? 5}
                  onChange={(e) => onRelevanceThresholdChange?.(Number(e.target.value))}
                  className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 font-body text-sm text-on-surface w-24 focus:outline-none focus:ring-2 focus:ring-secondary-brand"
                />
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="query-llm-judge" className="font-headline text-sm text-on-surface-variant w-28">
                  LLM Judge
                </label>
                <input
                  id="query-llm-judge"
                  type="checkbox"
                  checked={enableLlmJudge ?? true}
                  onChange={(e) => onEnableLlmJudgeChange?.(e.target.checked)}
                  className="w-4 h-4 accent-secondary-brand"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}