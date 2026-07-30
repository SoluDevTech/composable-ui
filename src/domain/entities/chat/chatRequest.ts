export type HITLAction = "approve" | "reject" | "edit";

export interface HitlDecisionInput {
  tool_call_id: string;
  action: HITLAction;
  reason?: string;
  edits?: Record<string, unknown>;
}

export interface ChatRequest {
  message?: string;
  tool_call_id?: string;
  action?: HITLAction;
  reason?: string;
  edits?: Record<string, unknown>;
  decisions?: HitlDecisionInput[];
}
