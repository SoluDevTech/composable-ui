import { describe, it, expect } from "vitest";
import { MessageRole, MessageStatus } from "@/domain/entities/chat/message";

describe("MessageRole", () => {
  it("has the correct enum values", () => {
    expect(MessageRole.HUMAN).toBe("human");
    expect(MessageRole.AI).toBe("ai");
    expect(MessageRole.SYSTEM).toBe("system");
    expect(MessageRole.TOOL).toBe("tool");
  });
});

describe("MessageStatus", () => {
  it("has the correct enum values", () => {
    expect(MessageStatus.COMPLETED).toBe("completed");
    expect(MessageStatus.AWAITING_HITL).toBe("awaiting_hitl");
  });
});
