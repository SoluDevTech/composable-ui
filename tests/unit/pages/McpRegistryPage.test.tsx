import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

// Hoisted config state: the page reads the built-in MCP servers from the
// app config (config.json). Mutable per test.
const { configState } = vi.hoisted(() => ({
  configState: {
    data: {
      apiBaseUrl: "http://api.test.com",
      wsBaseUrl: "ws://api.test.com",
      ragApiBaseUrl: "https://ragany.test.com",
      mcpApiBaseUrl: "",
      oauth2ProxyUrl: "",
      logtoUrl: "",
      logtoAppId: "",
      builtInMcpServers: [] as { name: string; url: string; transport: string }[],
    },
  },
}));

vi.mock("@/application/hooks/config/useConfig", () => ({
  useConfig: () => configState,
  useLogout: () => ({ logout: vi.fn(), canLogout: false }),
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

  it("renders the New MCP Server create card when the registry is empty", () => {
    registryState.data = [];
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    // Empty state now mirrors the other grids: a dashed create card is rendered
    // instead of a centered message + middle button.
    const createCard = document.querySelector('[data-od-id="mcp-server-card-new"]');
    expect(createCard).not.toBeNull();
    expect(createCard).toBeInTheDocument();
    expect(screen.getByText("New MCP Server")).toBeInTheDocument();
  });

  it("hides the built-in section when the config lists no built-in MCP servers", () => {
    registryState.data = servers;
    configState.data.builtInMcpServers = [];
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    expect(document.querySelector('[data-od-id="mcp-built-in-section"]')).toBeNull();
  });

  it("renders one read-only card per built-in MCP server from the config", () => {
    registryState.data = [];
    configState.data.builtInMcpServers = [
      { name: "raganything-files", url: "https://ragany.test.com/files/mcp", transport: "http" },
      {
        name: "raganything-classical",
        url: "https://ragany.test.com/classical/mcp",
        transport: "http",
      },
    ];
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    const section = document.querySelector('[data-od-id="mcp-built-in-section"]');
    expect(section).not.toBeNull();
    expect(screen.getByText("raganything-files")).toBeInTheDocument();
    expect(screen.getByText("https://ragany.test.com/files/mcp")).toBeInTheDocument();
    expect(screen.getByText("raganything-classical")).toBeInTheDocument();
    expect(screen.getByText("https://ragany.test.com/classical/mcp")).toBeInTheDocument();
    // One Register button per built-in server.
    expect(screen.getAllByRole("button", { name: /register/i })).toHaveLength(2);
  });

  it("opens the create dialog prefilled when clicking Register on a built-in card", async () => {
    const user = userEvent.setup();
    registryState.data = [];
    configState.data.builtInMcpServers = [
      { name: "raganything-files", url: "https://ragany.test.com/files/mcp", transport: "http" },
    ];
    renderWithProviders(<McpRegistryPage />, { initialEntries: ["/mcp-registry"] });

    await user.click(screen.getByRole("button", { name: /register/i }));

    const dlg = document.querySelector('[role=dialog]');
    expect(dlg).not.toBeNull();
    // Prefilled name + URL, create mode (no "Save" edit label).
    expect((dlg?.querySelector("#mcp-name") as HTMLInputElement | null)?.value).toBe(
      "raganything-files",
    );
    expect((dlg?.querySelector("#mcp-url") as HTMLInputElement | null)?.value).toBe(
      "https://ragany.test.com/files/mcp",
    );
  });
});
