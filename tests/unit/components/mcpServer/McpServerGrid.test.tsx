import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import McpServerGrid from "@/application/components/mcpServer/McpServerGrid";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";

vi.mock("@/application/hooks/mcpServer/useMcpRegistry");

import { useMcpRegistry } from "@/application/hooks/mcpServer/useMcpRegistry";

const mockedUseMcpRegistry = vi.mocked(useMcpRegistry);

function makeServer(overrides: Partial<RegisteredMcpServer> = {}): RegisteredMcpServer {
  return {
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
    ...overrides,
  };
}

describe("McpServerGrid", () => {
  it("shows loading text when loading", () => {
    mockedUseMcpRegistry.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useMcpRegistry>);

    renderWithProviders(
      <McpServerGrid onCreateNew={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("Loading MCP servers...")).toBeInTheDocument();
  });

  it("shows an error message when the registry fails to load", () => {
    mockedUseMcpRegistry.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("boom"),
    } as ReturnType<typeof useMcpRegistry>);

    renderWithProviders(
      <McpServerGrid onCreateNew={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText(/failed to load mcp servers: boom/i)).toBeInTheDocument();
  });

  it("renders one card per registered server", () => {
    mockedUseMcpRegistry.mockReturnValue({
      data: [
        makeServer({ name: "weather", url: "https://example.com/mcp" }),
        makeServer({ name: "github", url: "https://api.github.com/mcp" }),
      ],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMcpRegistry>);

    renderWithProviders(
      <McpServerGrid onCreateNew={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("weather")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/mcp")).toBeInTheDocument();
    expect(screen.getByText("github")).toBeInTheDocument();
    expect(screen.getByText("https://api.github.com/mcp")).toBeInTheDocument();
  });

  it("shows the New MCP Server card when the registry is empty", () => {
    mockedUseMcpRegistry.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMcpRegistry>);

    renderWithProviders(
      <McpServerGrid onCreateNew={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("New MCP Server")).toBeInTheDocument();
  });

  it("also shows the New MCP Server card when the registry is populated", () => {
    mockedUseMcpRegistry.mockReturnValue({
      data: [makeServer({ name: "weather" })],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMcpRegistry>);

    renderWithProviders(
      <McpServerGrid onCreateNew={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("weather")).toBeInTheDocument();
    expect(screen.getByText("New MCP Server")).toBeInTheDocument();
  });

  it("calls onCreateNew when the New MCP Server card is clicked", async () => {
    const user = userEvent.setup();
    mockedUseMcpRegistry.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMcpRegistry>);
    const onCreateNew = vi.fn();

    renderWithProviders(
      <McpServerGrid onCreateNew={onCreateNew} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    await user.click(screen.getByText("New MCP Server"));

    expect(onCreateNew).toHaveBeenCalledOnce();
  });

  it("forwards onEdit when a card's Edit button is clicked", async () => {
    const user = userEvent.setup();
    const server = makeServer({ name: "weather" });
    mockedUseMcpRegistry.mockReturnValue({
      data: [server],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMcpRegistry>);
    const onEdit = vi.fn();

    renderWithProviders(<McpServerGrid onCreateNew={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(server);
  });

  it("forwards onDelete when a card's Delete button is clicked", async () => {
    const user = userEvent.setup();
    const server = makeServer({ name: "weather" });
    mockedUseMcpRegistry.mockReturnValue({
      data: [server],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMcpRegistry>);
    const onDelete = vi.fn();

    renderWithProviders(
      <McpServerGrid onCreateNew={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith("weather");
  });
});
