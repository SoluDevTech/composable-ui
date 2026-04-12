import { describe, it, expect } from "vitest";
import { formatFileSize } from "@/application/lib/formatFileSize";

describe("formatFileSize", () => {
  it("returns 0 B for 0", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("returns bytes for values under 1 KB", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("returns 1.0 KB for 1024", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });

  it("returns 1.5 MB for 1536000", () => {
    expect(formatFileSize(1536000)).toBe("1.5 MB");
  });

  it("returns 1.0 GB for 1073741824", () => {
    expect(formatFileSize(1073741824)).toBe("1.0 GB");
  });

  it("returns 5.0 GB for 5368709120", () => {
    expect(formatFileSize(5368709120)).toBe("5.0 GB");
  });
});
