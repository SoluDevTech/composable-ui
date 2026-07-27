import { describe, it, expect } from "vitest";
import { getDisplayName, getInitials, type UserProfile } from "@/domain/entities/auth/currentUser";

describe("getDisplayName", () => {
  it("returns the name when present", () => {
    const profile: UserProfile = { userId: "u1", name: "Jane Doe", username: "jane", email: "j@x.com" };
    expect(getDisplayName(profile)).toBe("Jane Doe");
  });

  it("falls back to username when name is blank", () => {
    const profile: UserProfile = { userId: "u1", name: "  ", username: "jane", email: "j@x.com" };
    expect(getDisplayName(profile)).toBe("jane");
  });

  it("falls back to the email local part when name and username are absent", () => {
    const profile: UserProfile = { userId: "u1", email: "jane@example.com" };
    expect(getDisplayName(profile)).toBe("jane");
  });

  it("falls back to userId when no profile field is available", () => {
    const profile: UserProfile = { userId: "user-123" };
    expect(getDisplayName(profile)).toBe("user-123");
  });

  it("returns empty string for null/undefined profile", () => {
    expect(getDisplayName(null)).toBe("");
    expect(getDisplayName(undefined)).toBe("");
  });
});

describe("getInitials", () => {
  it("returns the first letters of the first two words", () => {
    expect(getInitials("Jane Doe")).toBe("JD");
  });

  it("returns a single initial for a single word", () => {
    expect(getInitials("jane")).toBe("J");
  });

  it("uppercases the initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("returns a single space for an empty display name", () => {
    expect(getInitials("")).toBe(" ");
  });

  it("ignores extra whitespace words", () => {
    expect(getInitials("Jane   Marie   Doe")).toBe("JM");
  });
});