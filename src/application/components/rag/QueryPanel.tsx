import { useState } from "react";
import PipelineToggle from "@/application/components/rag/PipelineToggle";
import QueryOptions from "@/application/components/rag/QueryOptions";
import QueryResults from "@/application/components/rag/QueryResults";
import { useRagQuery } from "@/application/hooks/rag/useRagQuery";
import { useClassicalQuery } from "@/application/hooks/rag/useClassicalQuery";
import type { QueryMode, ClassicalQueryMode } from "@/domain/entities/rag/queryRequest";

interface QueryPanelProps {
  workingDir: string;
}

export default function QueryPanel({
  workingDir,
}: Readonly<QueryPanelProps>) {
  const [pipeline, setPipeline] = useState<"lightrag" | "classical">("lightrag");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<QueryMode | ClassicalQueryMode>("naive");
  const [topK, setTopK] = useState(10);
  const [numVariations, setNumVariations] = useState(3);
  const [relevanceThreshold, setRelevanceThreshold] = useState(5);
  const [vectorDistanceThreshold, setVectorDistanceThreshold] = useState(0.5);
  const [enableLlmJudge, setEnableLlmJudge] = useState(true);

  const ragQuery = useRagQuery();
  const classicalQuery = useClassicalQuery();

  const result = pipeline === "lightrag" ? (ragQuery.data ?? null) : (classicalQuery.data ?? null);
  const isLoading = ragQuery.isPending || classicalQuery.isPending;
  const error = ragQuery.error || classicalQuery.error;

  function handleSearch() {
    if (!workingDir || !query.trim()) return;

    if (pipeline === "lightrag") {
      ragQuery.mutate({ workingDir, query, mode: mode as QueryMode, topK });
    } else {
      classicalQuery.mutate({
        workingDir,
        query,
        topK,
        numVariations,
        relevanceThreshold,
        vectorDistanceThreshold,
        enableLlmJudge,
        mode: mode as ClassicalQueryMode,
      });
    }
  }

  function handleRetry() {
    handleSearch();
  }

  function handlePipelineChange(value: "lightrag" | "classical") {
    setPipeline(value);
    setMode(value === "lightrag" ? "naive" : "vector");
  }

  return (
    <div className="space-y-6">
      <PipelineToggle value={pipeline} onChange={handlePipelineChange} />

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question about your documents..."
        rows={3}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body text-sm text-on-surface resize-y focus:outline-none focus:ring-2 focus:ring-secondary-brand"
      />

      <QueryOptions
        pipeline={pipeline}
        mode={mode}
        topK={topK}
        numVariations={numVariations}
        relevanceThreshold={relevanceThreshold}
        vectorDistanceThreshold={vectorDistanceThreshold}
        enableLlmJudge={enableLlmJudge}
        onModeChange={setMode}
        onTopKChange={setTopK}
        onNumVariationsChange={setNumVariations}
        onRelevanceThresholdChange={setRelevanceThreshold}
        onVectorDistanceThresholdChange={setVectorDistanceThreshold}
        onEnableLlmJudgeChange={setEnableLlmJudge}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!workingDir || isLoading || !query.trim()}
          className="flex items-center gap-2 bg-primary-container text-white rounded-full px-6 py-3 font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
              {"Searching..."}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg" aria-hidden="true">search</span>
              {"Search"}
            </>
          )}
        </button>
      </div>

      <div>
        <h3 className="font-headline text-sm font-semibold text-on-surface mb-3">
          Results
        </h3>
        <QueryResults
          data={result}
          error={error}
          isLoading={isLoading}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}