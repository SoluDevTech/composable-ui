import { describe, it, expect, vi } from "vitest";

vi.mock("@/infrastructure/config/envConfig", () => ({
  envConfig: {
    apiBaseUrl: "http://test-api:8010",
    wsBaseUrl: "ws://test-api:8010",
  },
}));

describe("axiosInstance", () => {
  it("apiClient has correct baseURL from envConfig", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");

    expect(apiClient.defaults.baseURL).toBe("http://test-api:8010");
  });

  it("apiClient has 30 second timeout", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");

    expect(apiClient.defaults.timeout).toBe(30000);
  });

  it("apiClient has Content-Type header set to application/json", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");

    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("error interceptor extracts detail from response", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");

    // Simulate an axios error with response.data.detail
    const axiosError = {
      response: {
        status: 400,
        data: { detail: "Agent not found" },
      },
      message: "Request failed with status code 400",
    };

    // Get the error interceptor (second argument of the response interceptor)
    const interceptors = (apiClient.interceptors.response as any).handlers;
    const errorHandler = interceptors[0]?.rejected;

    expect(errorHandler).toBeDefined();

    try {
      await errorHandler(axiosError);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Agent not found");
    }
  });

  it("error interceptor falls back to error.message when detail is absent", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");

    const axiosError = {
      response: {
        status: 500,
        data: {},
      },
      message: "Internal Server Error",
    };

    const interceptors = (apiClient.interceptors.response as any).handlers;
    const errorHandler = interceptors[0]?.rejected;

    try {
      await errorHandler(axiosError);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Internal Server Error");
    }
  });

  it("error interceptor passes through errors without response", async () => {
    const { apiClient } = await import("@/infrastructure/api/axiosInstance");

    const networkError = new Error("Network Error");

    const interceptors = (apiClient.interceptors.response as any).handlers;
    const errorHandler = interceptors[0]?.rejected;

    try {
      await errorHandler(networkError);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Network Error");
    }
  });
});
