import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Stub configRepository so the request interceptor can resolve baseURL.
const { MockFileConfigRepository } = vi.hoisted(() => {
  const mockConfig = {
    apiBaseUrl: "http://test-api:8010",
    wsBaseUrl: "ws://test-api:8010",
    ragApiBaseUrl: "",
    mcpApiBaseUrl: "",
  };
  class MockFileConfigRepository {
    getConfig = vi.fn().mockResolvedValue(mockConfig);
    isLoaded = vi.fn().mockReturnValue(false);
  }
  return { MockFileConfigRepository };
});

vi.mock("@/infrastructure/config/configRepositoryInstance", () => ({
  configRepository: new MockFileConfigRepository(),
}));

/**
 * Helper: extracts the rejected-handler from an axios instance response
 * interceptor stack and invokes it with a fake 401 axios error.
 *
 * The interceptor always rejects (so the caller's promise can surface the
 * error to React Query / the SSE handler), but the side-effect we care
 * about — setting window.location.href — happens *before* the reject.
 * We swallow the rejection here so the test can assert on the redirect.
 */
async function trigger401(client: any) {
  const handler = (client.interceptors.response as any).handlers[0]?.rejected;
  if (!handler) throw new Error("no rejected handler registered");
  const axios401 = {
    response: { status: 401, data: { detail: "Unauthorized" } },
    message: "Request failed with status code 401",
    config: { url: "/api/v1/something" },
  };
  await handler(axios401).catch(() => {
    /* expected — the interceptor rejects after redirecting */
  });
}

describe("axios instances — withCredentials + 401 redirect", () => {
  let originalLocation: Location;
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    originalLocation = window.location;
    hrefSetter = vi.fn();
    // Replace window.location with a writable mock so we can assert on href.
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        get href() {
          return "https://app.example.com/settings";
        },
        set href(value: string) {
          hrefSetter(value);
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
    vi.resetModules();
  });

  it("apiClient is created with withCredentials: true", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it("ragApiClient is created with withCredentials: true", async () => {
    const { ragApiClient } = await import("@/infrastructure/api/ragAxiosInstance");
    expect(ragApiClient.defaults.withCredentials).toBe(true);
  });

  it("mcpApiClient is created with withCredentials: true", async () => {
    const { mcpApiClient } = await import("@/infrastructure/api/mcpAxiosInstance");
    expect(mcpApiClient.defaults.withCredentials).toBe(true);
  });

  it("apiClient 401 interceptor redirects to /oauth2/start?rd=<currentUrl>", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");
    await trigger401(apiClient);
    expect(hrefSetter).toHaveBeenCalledTimes(1);
    expect(hrefSetter.mock.calls[0][0]).toBe(
      "/oauth2/start?rd=" + encodeURIComponent("https://app.example.com/settings"),
    );
  });

  it("ragApiClient 401 interceptor redirects to /oauth2/start", async () => {
    const { ragApiClient } = await import("@/infrastructure/api/ragAxiosInstance");
    await trigger401(ragApiClient);
    expect(hrefSetter).toHaveBeenCalledTimes(1);
    expect(hrefSetter.mock.calls[0][0]).toContain("/oauth2/start?rd=");
  });

  it("mcpApiClient 401 interceptor redirects to /oauth2/start", async () => {
    const { mcpApiClient } = await import("@/infrastructure/api/mcpAxiosInstance");
    await trigger401(mcpApiClient);
    expect(hrefSetter).toHaveBeenCalledTimes(1);
    expect(hrefSetter.mock.calls[0][0]).toContain("/oauth2/start?rd=");
  });

  it("apiClient non-401 error still rejects with the wrapped Error (status preserved)", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");
    const handler = (apiClient.interceptors.response as any).handlers[0]?.rejected;
    const axios500 = {
      response: { status: 500, data: { detail: "boom" } },
      message: "Request failed with status code 500",
      config: {},
    };
    await expect(handler(axios500)).rejects.toThrow("boom");
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("does not redirect when already on the oauth2/start path (avoid loop)", async () => {
    // Override href to look like we're already at the sign-in URL.
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: {
        href: "/oauth2/start?rd=https%3A%2F%2Fapp.example.com%2Fsettings",
        pathname: "/oauth2/start",
        // No setter here — if the redirect erroneously fires, the test would
        // throw on the assignment, which still counts as a failure. We assert
        // via hrefSetter being undefined.
      },
    });
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");
    await trigger401(apiClient);
    // No redirect should have happened — hrefSetter is not installed here,
    // so we simply assert the page location is unchanged.
    expect(window.location.href).toBe("/oauth2/start?rd=https%3A%2F%2Fapp.example.com%2Fsettings");
  });
});
