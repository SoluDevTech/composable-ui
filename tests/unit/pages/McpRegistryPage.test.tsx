import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../utils/render";
import McpRegistryPage from "@/application/pages/McpRegistryPage";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";

const servers: RegisteredMcpServer[] = [
  {
    name: "weather",
    transport: McpTransportType.HTTP,
    url: "https://example.com/mcp",
    headers: {},
    env: {},
    auth_token: null,
    tool_count: 5,
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-06T10:00:00Z",
    source_type: "external",
    openapi_url: null,
  },
  {
    name: "github",
    transport: McpTransportType.HTTP,
    url: "https://api.github.com/mcp",
    headers: {},
    env: {},
    auth_token: null,
    tool_count: 12,
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-06T10:00:00Z",
    source_type: "external",
    openapi_url: null,
  },
  {
    name: "petstore",
    transport: McpTransportType.HTTP,
    url: "",
    headers: {},
    env: {},
    auth_token: null,
    tool_count: 3,
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-06T10:00:00Z",
    source_type: "openapi",
    openapi_url: "https://example.com/openapi.json",
  },
];

// Hoisted mutable so we can flip the registry contents per test without
// redefining the (hoisted) vi.mock.
const { registryState } = vi.hoisted(() => ({
  registryState: {
    data: undefined as RegisteredMcpServer[] | undefined,
    isLoading: false,
    error: null as unknown,
  },
}));

vi.mock("@/application/hooks/mcpServer/useMcpRegistry", () => ({
  useMcpRegistry: () => registryState,
}));

vi.mock("@/application/hooks/mcpServer/useCreateMcpServer", () => ({
  useCreateMcpServer: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/application/hooks/mcpServer/useDeleteMcpServer", () => ({
  useDeleteMcpServer: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("McpRegistryPage", () => {
  it("renders a page container with data-od-id=mcp-registry-view", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    const container = document.querySelector('[data-od-id="mcp-registry-view"]');
    expect(container).not.toBeNull();
    expect(container).toBeInTheDocument();
  });

  it("renders the Add MCP Server button", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    expect(screen.getByRole("button", { name: /add mcp server/i })).toBeInTheDocument();
  });

  it("shows a count badge with the total number of servers", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    const badge = document.querySelector('[data-od-id="mcp-server-count"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toMatch(/3 servers/i);
  });

  it("renders one card per registered server with its name and url", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    expect(screen.getByText("weather")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/mcp")).toBeInTheDocument();

    expect(screen.getByText("github")).toBeInTheDocument();
    expect(screen.getByText("https://api.github.com/mcp")).toBeInTheDocument();
  });

  it("renders the tool count for each server card", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    expect(screen.getByText(/5 tools/i)).toBeInTheDocument();
    expect(screen.getByText(/12 tools/i)).toBeInTheDocument();
  });

  it("renders edit and delete actions for each card", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    // One edit button per card
    expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(3);
    // One delete button per card
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(3);
  });

  it("renders an OpenAPI badge and openapi_url for an openapi server", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    // The petstore card shows an OpenAPI badge.
    const openapiBadge = document.querySelector(
      '[data-od-id="mcp-server-card-petstore"] [data-od-id="mcp-source-type-badge"]',
    );
    expect(openapiBadge).not.toBeNull();
    expect(openapiBadge?.textContent).toMatch(/openapi/i);

    // The openapi_url is displayed on the card.
    expect(screen.getByText("https://example.com/openapi.json")).toBeInTheDocument();
  });

  it("renders an External badge for an external server", () => {
    registryState.data = servers;
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    const externalBadge = document.querySelector(
      '[data-od-id="mcp-server-card-weather"] [data-od-id="mcp-source-type-badge"]',
    );
    expect(externalBadge).not.toBeNull();
    expect(externalBadge?.textContent).toMatch(/external/i);
  });

  it("shows the empty state when the registry is empty", () => {
    registryState.data = [];
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    expect(screen.getByText(/no mcp servers/i)).toBeInTheDocument();
  });
});
