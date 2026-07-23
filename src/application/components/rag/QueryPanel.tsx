import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { Textarea } from "@/application/components/ui/textarea";
import QueryOptions from "@/application/components/rag/QueryOptions";
import QueryResults from "@/application/components/rag/QueryResults";
import WorkspaceSelector from "@/application/components/rag/WorkspaceSelector";
import { useClassicalQuery } from "@/application/hooks/rag/useClassicalQuery";
import type { ClassicalQueryMode } from "@/domain/entities/rag/queryRequest";

interface QueryPanelProps {
  workingDir: string;
  onWorkingDirChange?: (value: string) => void;
  folders?: string[];
}

export default function QueryPanel({
  workingDir,
  onWorkingDirChange = () => {},
  folders = [],
}: Readonly<QueryPanelProps>) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ClassicalQueryMode>("vector");
  const [topK, setTopK] = useState(10);
  const [numVariations, setNumVariations] = useState(3);
  const [relevanceThreshold, setRelevanceThreshold] = useState(5);
  const [vectorDistanceThreshold, setVectorDistanceThreshold] = useState(0.5);
  const [enableLlmJudge, setEnableLlmJudge] = useState(true);

  const classicalQuery = useClassicalQuery();

  const result = classicalQuery.data ?? null;
  const isLoading = classicalQuery.isPending;
  const error = classicalQuery.error;

  function handleSearch() {
    if (!workingDir || !query.trim()) return;
    classicalQuery.mutate({
      workingDir,
      query,
      topK,
      numVariations,
      relevanceThreshold,
      vectorDistanceThreshold,
      enableLlmJudge,
      mode,
    });
  }

  function handleRetry() {
    handleSearch();
  }

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question about your documents..."
        rows={3}
        data-od-id="rag-query-input"
        className="min-h-[120px] font-body text-sm text-fg placeholder:text-muted"
        aria-label="RAG query"
      />

      <QueryOptions
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

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <WorkspaceSelector value={workingDir} onChange={onWorkingDirChange} folders={folders} />
        </div>
        <Button
          type="button"
          variant="default"
          onClick={handleSearch}
          disabled={!workingDir || isLoading || !query.trim()}
          data-od-id="rag-search"
        >
          {isLoading ? (
            <>
              <span className="spin" aria-hidden="true" data-testid="query-spinner" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </>
          )}
        </Button>
      </div>

      <div>
        <h3 className="font-display text-sm text-fg mb-3">Results</h3>
        <QueryResults data={result} error={error} isLoading={isLoading} onRetry={handleRetry} />
      </div>
    </div>
  );
}
