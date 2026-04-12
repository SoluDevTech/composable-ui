import { describe, it, expect } from "vitest";

describe("FileEntry", () => {
  it("has objectName, size, and lastModified fields", async () => {
    const { FileEntry } = await import(
      "@/domain/entities/rag/fileEntry"
    );

    const entry = new FileEntry({
      objectName: "docs/readme.md",
      size: 1024,
      lastModified: "2026-04-06T10:00:00Z",
    });

    expect(entry.objectName).toBe("docs/readme.md");
    expect(entry.size).toBe(1024);
    expect(entry.lastModified).toBe("2026-04-06T10:00:00Z");
  });

  it("allows null lastModified", async () => {
    const { FileEntry } = await import(
      "@/domain/entities/rag/fileEntry"
    );

    const entry = new FileEntry({
      objectName: "docs/draft.txt",
      size: 500,
      lastModified: null,
    });

    expect(entry.lastModified).toBeNull();
  });

  it("extracts filename as the last path segment", async () => {
    const { FileEntry } = await import(
      "@/domain/entities/rag/fileEntry"
    );

    const entry = new FileEntry({
      objectName: "docs/reports/q1-summary.pdf",
      size: 2048,
      lastModified: "2026-04-06T10:00:00Z",
    });

    expect(entry.filename).toBe("q1-summary.pdf");
  });

  it("returns the full objectName as filename when no slashes", async () => {
    const { FileEntry } = await import(
      "@/domain/entities/rag/fileEntry"
    );

    const entry = new FileEntry({
      objectName: "readme.md",
      size: 100,
      lastModified: "2026-04-06T10:00:00Z",
    });

    expect(entry.filename).toBe("readme.md");
  });
});

describe("FolderEntry", () => {
  it("has a prefix field ending with slash", async () => {
    const { FolderEntry } = await import(
      "@/domain/entities/rag/fileEntry"
    );

    const entry = new FolderEntry({ prefix: "docs/" });

    expect(entry.prefix).toBe("docs/");
  });

  it("extracts folder name without trailing slash", async () => {
    const { FolderEntry } = await import(
      "@/domain/entities/rag/fileEntry"
    );

    const entry = new FolderEntry({ prefix: "reports/2026/" });

    expect(entry.name).toBe("2026");
  });

  it("returns prefix without slash as name for single-level folder", async () => {
    const { FolderEntry } = await import(
      "@/domain/entities/rag/fileEntry"
    );

    const entry = new FolderEntry({ prefix: "docs/" });

    expect(entry.name).toBe("docs");
  });
});
