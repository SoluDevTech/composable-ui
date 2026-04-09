import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FileConfigRepository } from "@/infrastructure/config/fileConfigRepository";

const { mockToast } = vi.hoisted(() => ({
  mockToast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

describe("FileConfigRepository", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getConfig", () => {
    it("should fetch config from /config.json", async () => {
      const mockConfig = {
        apiBaseUrl: "http://api.test.com",
        wsBaseUrl: "ws://api.test.com",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as Response);

      const repo = new FileConfigRepository();
      const config = await repo.getConfig();

      expect(fetch).toHaveBeenCalledWith("/config.json");
      expect(config).toEqual(mockConfig);
    });

    it("should cache config after first load", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            apiBaseUrl: "http://api.test.com",
            wsBaseUrl: "ws://api.test.com",
          }),
      } as Response);

      const repo = new FileConfigRepository();
      await repo.getConfig();
      await repo.getConfig();

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should report isLoaded correctly", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            apiBaseUrl: "http://api.test.com",
            wsBaseUrl: "ws://api.test.com",
          }),
      } as Response);

      const repo = new FileConfigRepository();
      expect(repo.isLoaded()).toBe(false);

      await repo.getConfig();
      expect(repo.isLoaded()).toBe(true);
    });

    it("should show toast on fetch failure", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const repo = new FileConfigRepository();
      await expect(repo.getConfig()).rejects.toThrow(
        "Failed to load config: 500",
      );

      expect(mockToast.error).toHaveBeenCalledWith("Configuration Error", {
        description: "App is not configured.",
      });
    });

    it("should show toast on network error", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      const repo = new FileConfigRepository();
      await expect(repo.getConfig()).rejects.toThrow("Network error");

      expect(mockToast.error).toHaveBeenCalledWith("Configuration Error", {
        description: "App is not configured.",
      });
    });

    it("should allow retry after fetch failure", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const repo = new FileConfigRepository();
      await expect(repo.getConfig()).rejects.toThrow("Network error");

      const mockConfig = {
        apiBaseUrl: "http://api.test.com",
        wsBaseUrl: "ws://api.test.com",
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as Response);

      const config = await repo.getConfig();
      expect(config).toEqual(mockConfig);
    });

    it("should handle concurrent getConfig calls", async () => {
      let resolvePromise: (value: Response) => void;
      vi.mocked(fetch).mockReturnValue(
        new Promise<Response>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const repo = new FileConfigRepository();
      const p1 = repo.getConfig();
      const p2 = repo.getConfig();

      resolvePromise!({
        ok: true,
        json: () =>
          Promise.resolve({
            apiBaseUrl: "http://api.test.com",
            wsBaseUrl: "ws://api.test.com",
          }),
      } as Response);

      const [config1, config2] = await Promise.all([p1, p2]);
      expect(config1).toEqual(config2);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
