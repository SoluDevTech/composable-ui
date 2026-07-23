import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { useSendMessage } from "@/application/hooks/chat/useSendMessage";
import type { ToolCall } from "@/domain/entities/chat/message";

interface HITLReviewPanelProps {
  toolCalls: ToolCall[];
  threadId: string;
}

type ReviewState = "idle" | "reviewing" | "rejecting";

export default function HITLReviewPanel({ toolCalls, threadId }: Readonly<HITLReviewPanelProps>) {
  const [reviewState, setReviewState] = useState<ReviewState>("idle");
  const [rejectReason, setRejectReason] = useState("");
  const sendMessage = useSendMessage(threadId);

  const toolName = toolCalls[0]?.name ?? "Unknown tool";
  const toolCallId = toolCalls[0]?.id ?? "";

  function handleApprove() {
    sendMessage.mutate({
      tool_call_id: toolCallId,
      action: "approve",
    });
  }

  function handleReject() {
    if (reviewState !== "rejecting") {
      setReviewState("rejecting");
      return;
    }

    sendMessage.mutate(
      {
        tool_call_id: toolCallId,
        action: "reject",
        reason: rejectReason || "Rejected by user",
      },
      {
        onSuccess: () => {
          setReviewState("idle");
          setRejectReason("");
        },
      },
    );
  }

  if (reviewState === "idle") {
    return (
      <div data-od-id="hitl-panel" className="mt-2 border border-warn bg-bg">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warn" aria-hidden="true" />
            <span className="font-mono text-xs text-fg">
              Validation required: <span className="font-mono">{toolName}</span>
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setReviewState("reviewing")}
          >
            Review Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-od-id="hitl-panel" className="mt-2 border border-warn bg-bg">
      <div className="flex items-center gap-2 px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-warn" aria-hidden="true" />
        <span className="font-mono text-xs text-fg">
          Review: <span className="font-mono">{toolName}</span>
        </span>
      </div>

      {toolCalls[0]?.args && (
        <pre className="overflow-x-auto border-t border-border bg-bg px-3 py-2 font-mono text-xs text-fg-2">
          {JSON.stringify(toolCalls[0].args, null, 2)}
        </pre>
      )}

      {reviewState === "rejecting" && (
        <div className="flex gap-2 border-t border-border p-3">
          <Input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            className="flex-1"
          />
        </div>
      )}

      <div className="flex gap-2 border-t border-border p-3">
        <Button
          type="button"
          variant="success"
          size="sm"
          onClick={handleApprove}
          disabled={sendMessage.isPending}
        >
          <Check className="h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleReject}
          disabled={sendMessage.isPending}
        >
          <X className="h-3.5 w-3.5" />
          {reviewState === "rejecting" ? "Confirm Reject" : "Reject"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setReviewState("idle");
            setRejectReason("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
