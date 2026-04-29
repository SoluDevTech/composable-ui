export enum StreamEventType {
  THINKING = "thinking",
  CONTENT = "content",
  MESSAGE = "message",
}

export interface StreamEvent {
  type: StreamEventType;
  data: string;
}
