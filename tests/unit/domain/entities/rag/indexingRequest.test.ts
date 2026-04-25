import { describe, it, expect } from "vitest";

describe("IndexFileRequest", () => {
  it("allows constructing an object with all required fields", async () => {
    const { IndexFileRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const request: IndexFileRequest = {
      file_name: "report.pdf",
      working_dir: "/data/projects/acme",
    };

    expect(request.file_name).toBe("report.pdf");
    expect(request.working_dir).toBe("/data/projects/acme");
  });

  it("accepts various file name formats", async () => {
    const { IndexFileRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const mdRequest: IndexFileRequest = {
      file_name: "docs/guide.md",
      working_dir: "/data/test",
    };

    expect(mdRequest.file_name).toBe("docs/guide.md");

    const pdfRequest: IndexFileRequest = {
      file_name: "annual-report-2026.pdf",
      working_dir: "/data/reports",
    };

    expect(pdfRequest.file_name).toBe("annual-report-2026.pdf");
  });
});

describe("IndexFolderRequest", () => {
  it("allows constructing an object with all required fields", async () => {
    const { IndexFolderRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const request: IndexFolderRequest = {
      working_dir: "/data/projects/acme",
      recursive: true,
    };

    expect(request.working_dir).toBe("/data/projects/acme");
    expect(request.recursive).toBe(true);
  });

  it("accepts optional file_extensions", async () => {
    const { IndexFolderRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const withExtensions: IndexFolderRequest = {
      working_dir: "/data/projects/acme",
      recursive: false,
      file_extensions: [".md", ".txt", ".pdf"],
    };

    expect(withExtensions.file_extensions).toEqual([".md", ".txt", ".pdf"]);
  });

  it("allows omitting optional file_extensions", async () => {
    const { IndexFolderRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const withoutExtensions: IndexFolderRequest = {
      working_dir: "/data/projects/acme",
      recursive: true,
    };

    expect(withoutExtensions.file_extensions).toBeUndefined();
  });

  it("supports non-recursive folder indexing", async () => {
    const { IndexFolderRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const request: IndexFolderRequest = {
      working_dir: "/data/docs",
      recursive: false,
    };

    expect(request.recursive).toBe(false);
  });
});

describe("ClassicalIndexFileRequest", () => {
  it("allows constructing an object with all required fields", async () => {
    const { ClassicalIndexFileRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const request: ClassicalIndexFileRequest = {
      file_name: "handbook.docx",
      working_dir: "/data/hr",
      chunk_size: 512,
      chunk_overlap: 64,
    };

    expect(request.file_name).toBe("handbook.docx");
    expect(request.working_dir).toBe("/data/hr");
    expect(request.chunk_size).toBe(512);
    expect(request.chunk_overlap).toBe(64);
  });

  it("accepts different chunk configurations", async () => {
    const { ClassicalIndexFileRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const smallChunks: ClassicalIndexFileRequest = {
      file_name: "data.csv",
      working_dir: "/data",
      chunk_size: 128,
      chunk_overlap: 16,
    };

    expect(smallChunks.chunk_size).toBe(128);
    expect(smallChunks.chunk_overlap).toBe(16);

    const largeChunks: ClassicalIndexFileRequest = {
      file_name: "data.csv",
      working_dir: "/data",
      chunk_size: 2048,
      chunk_overlap: 256,
    };

    expect(largeChunks.chunk_size).toBe(2048);
    expect(largeChunks.chunk_overlap).toBe(256);
  });
});

describe("ClassicalIndexFolderRequest", () => {
  it("allows constructing an object with all required fields", async () => {
    const { ClassicalIndexFolderRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const request: ClassicalIndexFolderRequest = {
      working_dir: "/data/projects/acme",
      recursive: true,
      chunk_size: 1024,
      chunk_overlap: 128,
    };

    expect(request.working_dir).toBe("/data/projects/acme");
    expect(request.recursive).toBe(true);
    expect(request.chunk_size).toBe(1024);
    expect(request.chunk_overlap).toBe(128);
  });

  it("accepts optional file_extensions", async () => {
    const { ClassicalIndexFolderRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const withExtensions: ClassicalIndexFolderRequest = {
      working_dir: "/data/docs",
      recursive: false,
      file_extensions: [".py", ".js", ".ts"],
      chunk_size: 512,
      chunk_overlap: 50,
    };

    expect(withExtensions.file_extensions).toEqual([".py", ".js", ".ts"]);
  });

  it("allows omitting optional file_extensions", async () => {
    const { ClassicalIndexFolderRequest } = await import(
      "@/domain/entities/rag/indexingRequest"
    );

    const withoutExtensions: ClassicalIndexFolderRequest = {
      working_dir: "/data/docs",
      recursive: true,
      chunk_size: 512,
      chunk_overlap: 50,
    };

    expect(withoutExtensions.file_extensions).toBeUndefined();
  });
});