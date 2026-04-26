import { describe, it, expect } from "vitest";

describe("DocumentMetadata", () => {
  it("allows constructing an object with format_type and mime_type", async () => {
    const { DocumentMetadata } = await import(
      "@/domain/entities/rag/fileContent"
    );

    const metadata: DocumentMetadata = {
      format_type: "markdown",
      mime_type: "text/markdown",
    };

    expect(metadata.format_type).toBe("markdown");
    expect(metadata.mime_type).toBe("text/markdown");
  });

  it("accepts various format and mime type combinations", async () => {
    const { DocumentMetadata } = await import(
      "@/domain/entities/rag/fileContent"
    );

    const pdfMeta: DocumentMetadata = {
      format_type: "pdf",
      mime_type: "application/pdf",
    };
    expect(pdfMeta.format_type).toBe("pdf");
    expect(pdfMeta.mime_type).toBe("application/pdf");

    const textMeta: DocumentMetadata = {
      format_type: "plain",
      mime_type: "text/plain",
    };
    expect(textMeta.format_type).toBe("plain");
    expect(textMeta.mime_type).toBe("text/plain");
  });
});

describe("TableData", () => {
  it("allows constructing an object with headers and rows", async () => {
    const { TableData } = await import("@/domain/entities/rag/fileContent");

    const table: TableData = {
      headers: ["Name", "Age", "City"],
      rows: [
        ["Alice", "30", "NYC"],
        ["Bob", "25", "LA"],
      ],
    };

    expect(table.headers).toEqual(["Name", "Age", "City"]);
    expect(table.rows).toEqual([
      ["Alice", "30", "NYC"],
      ["Bob", "25", "LA"],
    ]);
  });

  it("allows an empty rows array", async () => {
    const { TableData } = await import("@/domain/entities/rag/fileContent");

    const emptyTable: TableData = {
      headers: ["Col1", "Col2"],
      rows: [],
    };

    expect(emptyTable.headers).toEqual(["Col1", "Col2"]);
    expect(emptyTable.rows).toEqual([]);
  });

  it("allows a single-row table", async () => {
    const { TableData } = await import("@/domain/entities/rag/fileContent");

    const singleRow: TableData = {
      headers: ["Metric", "Value"],
      rows: [["Throughput", "99.5%"]],
    };

    expect(singleRow.rows).toHaveLength(1);
    expect(singleRow.rows[0]).toEqual(["Throughput", "99.5%"]);
  });
});

describe("FileContentResponse", () => {
  it("allows constructing a response with content, metadata, and tables", async () => {
    const { FileContentResponse } = await import(
      "@/domain/entities/rag/fileContent"
    );

    const response: FileContentResponse = {
      content: "This is the extracted text content.",
      metadata: {
        format_type: "pdf",
        mime_type: "application/pdf",
      },
      tables: [
        {
          headers: ["Item", "Price"],
          rows: [["Widget", "$10"]],
        },
      ],
    };

    expect(response.content).toBe("This is the extracted text content.");
    expect(response.metadata.format_type).toBe("pdf");
    expect(response.metadata.mime_type).toBe("application/pdf");
    expect(response.tables).toHaveLength(1);
    expect(response.tables[0].headers).toEqual(["Item", "Price"]);
    expect(response.tables[0].rows).toEqual([["Widget", "$10"]]);
  });

  it("allows constructing a response with empty tables", async () => {
    const { FileContentResponse } = await import(
      "@/domain/entities/rag/fileContent"
    );

    const response: FileContentResponse = {
      content: "Plain text with no tables.",
      metadata: {
        format_type: "plain",
        mime_type: "text/plain",
      },
      tables: [],
    };

    expect(response.content).toBe("Plain text with no tables.");
    expect(response.tables).toEqual([]);
  });

  it("allows constructing a response with multiple tables", async () => {
    const { FileContentResponse } = await import(
      "@/domain/entities/rag/fileContent"
    );

    const response: FileContentResponse = {
      content: "Document with multiple tables.",
      metadata: {
        format_type: "html",
        mime_type: "text/html",
      },
      tables: [
        {
          headers: ["A", "B"],
          rows: [["1", "2"]],
        },
        {
          headers: ["X", "Y"],
          rows: [["3", "4"], ["5", "6"]],
        },
      ],
    };

    expect(response.tables).toHaveLength(2);
    expect(response.tables[1].headers).toEqual(["X", "Y"]);
    expect(response.tables[1].rows).toEqual([
      ["3", "4"],
      ["5", "6"],
    ]);
  });
});