export enum StreamEventType {
  THINKING = "thinking",
  CONTENT = "content",
  STRUCTURED = "structured",
  MESSAGE = "message",
  ERROR = "error",
}

export interface StreamEvent {
  type: StreamEventType;
  data: string;
}
