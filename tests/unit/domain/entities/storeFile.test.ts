import { describe, it, expect } from "vitest";
import type { StoreFileMetadata, StoreFile } from "@/domain/entities/store/storeFile";

describe("StoreFileMetadata", () => {
  it("type exists with a path field", () => {
    // Arrange & Act — construct a value conforming to the type
    const metadata: StoreFileMetadata = { path: "skills/rag/SKILL.md" };

    // Assert — the path field is present and assignable
    expect(metadata.path).toBe("skills/rag/SKILL.md");
  });
});

describe("StoreFile", () => {
  it("type exists with path and content fields", () => {
    // Arrange & Act — construct a value conforming to the type
    const file: StoreFile = {
      path: "skills/rag/SKILL.md",
      content: "---\nname: rag\n---\n# RAG skill",
    };

    // Assert — both fields are present and assignable
    expect(file.path).toBe("skills/rag/SKILL.md");
    expect(file.content).toBe("---\nname: rag\n---\n# RAG skill");
  });
});