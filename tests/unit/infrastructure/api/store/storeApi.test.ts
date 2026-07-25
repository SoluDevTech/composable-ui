import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/infrastructure/api/axiosInstance", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/infrastructure/api/axiosInstance";
import { storeApi } from "@/infrastructure/api/store/storeApi";

describe("storeApi.getFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the error has status 404 (interceptor-unwrapped)", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      Object.assign(new Error("File not found: /skills/ghost/SKILL.md"), {
        status: 404,
      }),
    );

    const result = await storeApi.getFile("/skills/ghost/SKILL.md");

    expect(result).toBeNull();
  });

  it("returns null when the raw axios error has response.status 404", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: { status: 404, data: { detail: "File not found" } },
      message: "Request failed with status code 404",
    });

    const result = await storeApi.getFile("/skills/ghost/SKILL.md");

    expect(result).toBeNull();
  });

  it("rethrows on non-404 status (500)", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      Object.assign(new Error("Internal Server Error"), { status: 500 }),
    );

    await expect(storeApi.getFile("/skills/x/SKILL.md")).rejects.toThrow("Internal Server Error");
  });

  it("returns data when the file exists", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { path: "/skills/rag/SKILL.md", content: "# RAG" },
    });

    const result = await storeApi.getFile("/skills/rag/SKILL.md");

    expect(result).toEqual({ path: "/skills/rag/SKILL.md", content: "# RAG" });
  });
});
