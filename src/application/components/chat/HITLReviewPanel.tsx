import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { useSendMessage } from "@/application/hooks/chat/useSendMessage";
import type { ToolCall } from "@/domain/entities/chat/message";
import type { HitlDecisionInput } from "@/domain/entities/chat/chatRequest";

interface HITLReviewPanelProps {
  toolCalls: ToolCall[];
  threadId: string;
}

type DecisionAction = "approve" | "reject";

interface ToolDecisionRowProps {
  toolCall: ToolCall;
  isRejecting: boolean;
  rejectReason: string;
  isPending: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReasonChange: (id: string, reason: string) => void;
  onConfirmReject: () => void;
}

function ToolDecisionRow({
  toolCall,
  isRejecting,
  rejectReason,
  isPending,
  onApprove,
  onReject,
  onReasonChange,
  onConfirmReject,
}: Readonly<ToolDecisionRowProps>) {
  return (
    <div className="border-t border-border">
      <div className="px-3 py-2">
        <span className="font-mono text-xs text-fg">{toolCall.name}</span>
      </div>
      {toolCall.args && Object.keys(toolCall.args).length > 0 && (
        <pre className="overflow-x-auto bg-bg px-3 py-2 font-mono text-xs text-fg-2">
          {JSON.stringify(toolCall.args, null, 2)}
        </pre>
      )}
      <div className="flex flex-wrap gap-2 p-3">
        <Button
          type="button"
          variant="success"
          size="sm"
          onClick={() => onApprove(toolCall.id)}
          disabled={isPending}
        >
          <Check className="h-3.5 w-3.5" />
          Approve {toolCall.name}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onReject(toolCall.id)}
          disabled={isPending}
        >
          <X className="h-3.5 w-3.5" />
          Reject {toolCall.name}
        </Button>
      </div>
      {isRejecting && (
        <div className="flex flex-wrap gap-2 border-t border-border p-3">
          <Input
            type="text"
            value={rejectReason}
            onChange={(e) => onReasonChange(toolCall.id, e.target.value)}
            placeholder="Reason for rejection (optional)"
            className="flex-1"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirmReject}
            disabled={isPending}
          >
            Confirm Reject
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HITLReviewPanel({ toolCalls, threadId }: Readonly<HITLReviewPanelProps>) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, DecisionAction>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const sendMessage = useSendMessage(threadId);

  function handleApprove(id: string) {
    setDecisions((prev) => ({ ...prev, [id]: "approve" }));
    setRejectingId(null);
  }

  function handleReject(id: string) {
    setDecisions((prev) => ({ ...prev, [id]: "reject" }));
    setRejectingId(id);
  }

  function handleReasonChange(id: string, reason: string) {
    setReasons((prev) => ({ ...prev, [id]: reason }));
  }

  function buildDecisions(): HitlDecisionInput[] {
    return toolCalls.map((tc) => {
      const action = decisions[tc.id] ?? "approve";
      if (action === "reject") {
        const reason = reasons[tc.id];
        if (reason) {
          return { tool_call_id: tc.id, action: "reject", reason };
        }
        return { tool_call_id: tc.id, action: "reject" };
      }
      return { tool_call_id: tc.id, action: "approve" };
    });
  }

  function handleSubmit() {
    sendMessage.mutate({ decisions: buildDecisions() });
    setIsReviewing(false);
    setDecisions({});
    setReasons({});
    setRejectingId(null);
  }

  const hasToolCalls = toolCalls.length > 0;

  return (
    <div data-od-id="hitl-panel" className="mt-2 border border-warn bg-bg">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warn" aria-hidden="true" />
          <span className="font-mono text-xs text-fg">Validation required</span>
        </div>
        {!isReviewing && hasToolCalls && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsReviewing(true)}>
            Review Data
          </Button>
        )}
      </div>

      {hasToolCalls && isReviewing && (
        <>
          {toolCalls.map((tc) => (
            <ToolDecisionRow
              key={tc.id}
              toolCall={tc}
              isRejecting={rejectingId === tc.id}
              rejectReason={reasons[tc.id] ?? ""}
              isPending={sendMessage.isPending}
              onApprove={handleApprove}
              onReject={handleReject}
              onReasonChange={handleReasonChange}
              onConfirmReject={handleSubmit}
            />
          ))}
        </>
      )}
      {hasToolCalls && !isReviewing && (
        <div className="border-t border-border px-3 py-2">
          {toolCalls.map((tc) => (
            <div key={tc.id} className="font-mono text-xs text-fg">
              {tc.name}
            </div>
          ))}
        </div>
      )}
      {!hasToolCalls && (
        <div className="border-t border-border px-3 py-2">
          <span className="font-mono text-xs text-fg">Unknown tool</span>
        </div>
      )}

      {sendMessage.isError && sendMessage.error && (
        <div className="border-t border-danger p-3">
          <p className="font-mono text-xs text-danger">{sendMessage.error.message}</p>
        </div>
      )}

      {isReviewing && hasToolCalls && (
        <div className="border-t border-border p-3">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={sendMessage.isPending}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}
