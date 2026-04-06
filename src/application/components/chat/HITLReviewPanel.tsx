import { useState } from "react";
import { cn } from "@/application/lib/utils";
import { useSendMessage } from "@/application/hooks/chat/useSendMessage";
import type { ToolCall } from "@/domain/entities/chat/message";

interface HITLReviewPanelProps {
  toolCalls: ToolCall[];
  threadId: string;
}

type ReviewState = "idle" | "reviewing" | "rejecting";

export default function HITLReviewPanel({
  toolCalls,
  threadId,
}: Readonly<HITLReviewPanelProps>) {
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
      <div className="mt-4 p-4 bg-surface-container-low rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary-brand text-xl">
            warning
          </span>
          <span className="text-sm font-medium text-on-surface">
            Validation required: <span className="font-mono">{toolName}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setReviewState("reviewing")}
          className="bg-on-surface text-white rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Review Data
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-surface-container-low rounded-xl space-y-4">
      {/* Tool call details */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary-brand text-xl">
          warning
        </span>
        <span className="text-sm font-medium text-on-surface">
          Review: <span className="font-mono">{toolName}</span>
        </span>
      </div>

      {/* Args display */}
      {toolCalls[0]?.args && (
        <pre className="bg-surface-container rounded-lg p-3 text-xs font-mono text-on-surface overflow-x-auto">
          {JSON.stringify(toolCalls[0].args, null, 2)}
        </pre>
      )}

      {/* Reject reason input */}
      {reviewState === "rejecting" && (
        <input
          type="text"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (optional)"
          className="w-full px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-brand/40"
        />
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={sendMessage.isPending}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors",
            "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50",
          )}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={sendMessage.isPending}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors",
            "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
          )}
        >
          {reviewState === "rejecting" ? "Confirm Reject" : "Reject"}
        </button>
        <button
          type="button"
          onClick={() => {
            setReviewState("idle");
            setRejectReason("");
          }}
          className="px-4 py-2.5 rounded-full border border-outline-variant/30 text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
