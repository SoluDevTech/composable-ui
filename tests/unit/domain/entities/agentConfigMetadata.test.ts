import { describe, it, expect } from "vitest";
import { createAgentConfigMetadata } from "../../../fixtures/external";

describe("AgentConfigMetadata", () => {
  it("does NOT include is_builtin (field removed by migration 003)", () => {
    // TS types are erased at runtime, so we assert via the fixture: the
    // property must not be present on the produced object.
    const metadata = createAgentConfigMetadata();

    expect("is_builtin" in metadata).toBe(false);
    expect(metadata).not.toHaveProperty("is_builtin");
  });

  it("includes the expected fields", () => {
    const metadata = createAgentConfigMetadata();

    expect(metadata).toHaveProperty("name");
    expect(metadata).toHaveProperty("model");
    expect(metadata).toHaveProperty("minio_path");
    expect(metadata).toHaveProperty("created_at");
    expect(metadata).toHaveProperty("updated_at");
  });

  it("accepts optional description (string | null) — defaults to null", () => {
    // Arrange — the default fixture must surface a description field
    // (null when unspecified) so the metadata reflects the new schema.
    const metadata = createAgentConfigMetadata();

    // Assert — description must be present on the metadata object.
    expect(metadata).toHaveProperty("description");
    expect(metadata.description).toBeNull();
  });

  it("accepts a string description via overrides", () => {
    const metadata = createAgentConfigMetadata({
      description: "An agent that writes tests.",
    } as Partial<ReturnType<typeof createAgentConfigMetadata>>);

    expect(metadata).toHaveProperty("description", "An agent that writes tests.");
  });
});
