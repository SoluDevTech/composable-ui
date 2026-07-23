import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot } from "lucide-react";
import type { TraceEvent } from "@/domain/entities/chat/traceEvent";
import ThinkingBlock from "@/application/components/chat/ThinkingBlock";
import ToolCallBadge from "@/application/components/chat/ToolCallBadge";
import ToolResultBlock from "@/application/components/chat/ToolResultBlock";
import { MARKDOWN_PROSE_CLASSES } from "@/application/components/chat/markdownStyles";

interface SubagentPanelProps {
  name: string;
  content: string;
  thinking: string;
  toolCalls: TraceEvent[];
  toolResults: TraceEvent[];
}

function SubagentPanelImpl({
  name,
  content,
  thinking,
  toolCalls,
  toolResults,
}: Readonly<SubagentPanelProps>) {
  return (
    <section
      className="mt-2 border-l-2 border-cyan bg-surface-warm p-4"
      data-od-id="subagent-panel"
      aria-label={`Subagent ${name}`}
    >
      <header className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-cyan">
        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{name}</span>
      </header>

      <div className="mt-2 flex flex-col gap-2">
        <ThinkingBlock text={thinking} source={name} />

        {toolCalls.map((call) => (
          <ToolCallBadge
            key={call.id}
            name={call.name ?? "unknown"}
            args={call.content}
            source={call.source ?? name}
          />
        ))}

        {toolResults.map((result) => (
          <ToolResultBlock
            key={result.id}
            name={result.name}
            content={result.content}
            source={result.source ?? name}
          />
        ))}

        {content && (
          <div className={MARKDOWN_PROSE_CLASSES}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </section>
  );
}

const SubagentPanel = memo(SubagentPanelImpl, (prev, next) => {
  return (
    prev.name === next.name &&
    prev.content === next.content &&
    prev.thinking === next.thinking &&
    prev.toolCalls === next.toolCalls &&
    prev.toolResults === next.toolResults
  );
});

export default SubagentPanel;
