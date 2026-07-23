import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/application/components/ui/select";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import type { ClassicalQueryMode } from "@/domain/entities/rag/queryRequest";

interface QueryOptionsProps {
  mode: ClassicalQueryMode;
  topK: number;
  numVariations: number;
  relevanceThreshold: number;
  vectorDistanceThreshold: number;
  enableLlmJudge: boolean;
  onModeChange: (mode: ClassicalQueryMode) => void;
  onTopKChange: (topK: number) => void;
  onNumVariationsChange: (val: number) => void;
  onRelevanceThresholdChange: (val: number) => void;
  onVectorDistanceThresholdChange: (val: number) => void;
  onEnableLlmJudgeChange: (val: boolean) => void;
}

const CLASSICAL_MODES: { value: ClassicalQueryMode; label: string }[] = [
  { value: "vector", label: "Vector" },
  { value: "hybrid", label: "Hybrid" },
];

const LLM_JUDGE_OPTIONS = [
  { value: "true", label: "Enabled" },
  { value: "false", label: "Disabled" },
] as const;

export default function QueryOptions({
  mode,
  topK,
  numVariations,
  relevanceThreshold,
  vectorDistanceThreshold,
  enableLlmJudge,
  onModeChange,
  onTopKChange,
  onNumVariationsChange,
  onRelevanceThresholdChange,
  onVectorDistanceThresholdChange,
  onEnableLlmJudgeChange,
}: Readonly<QueryOptionsProps>) {
  const [expanded, setExpanded] = useState(false);

  const llmJudgeValue = enableLlmJudge ? "true" : "false";

  return (
    <div className="border border-border bg-surface p-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-muted font-mono text-sm transition-[color] duration-fast ease-standard hover:text-accent"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
        Advanced Options
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-mode" className="text-muted">
              Mode
            </Label>
            <Select value={mode} onValueChange={(v) => onModeChange(v as ClassicalQueryMode)}>
              <SelectTrigger id="query-mode" data-od-id="query-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {CLASSICAL_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-topk" className="text-muted">
              Top K
            </Label>
            <Input
              id="query-topk"
              type="number"
              min={1}
              max={100}
              value={topK}
              onChange={(e) => onTopKChange(Number(e.target.value))}
              data-od-id="query-topk"
              className="w-24"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-variations" className="text-muted">
              Variations
            </Label>
            <Input
              id="query-variations"
              type="number"
              min={1}
              max={10}
              value={numVariations}
              onChange={(e) => onNumVariationsChange(Number(e.target.value))}
              data-od-id="query-num-variations"
              className="w-24"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-threshold" className="text-muted">
              Relevance Threshold
            </Label>
            <Input
              id="query-threshold"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={relevanceThreshold}
              onChange={(e) => onRelevanceThresholdChange(Number(e.target.value))}
              data-od-id="query-relevance"
              className="w-24"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-vector-threshold" className="text-muted">
              Vector Distance
            </Label>
            <Input
              id="query-vector-threshold"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={vectorDistanceThreshold}
              onChange={(e) => onVectorDistanceThresholdChange(Number(e.target.value))}
              data-od-id="query-vector-distance"
              className="w-24"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-llm-judge" className="text-muted">
              LLM Judge
            </Label>
            <Select
              value={llmJudgeValue}
              onValueChange={(v) => onEnableLlmJudgeChange(v === "true")}
            >
              <SelectTrigger id="query-llm-judge" data-od-id="query-llm-judge" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LLM_JUDGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
