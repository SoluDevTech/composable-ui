export enum StreamEventType {
  THINKING = "thinking",
  CONTENT = "content",
  MESSAGE = "message",
  ERROR = "error",
}

export interface StreamEvent {
  type: StreamEventType;
  data: string;
}
