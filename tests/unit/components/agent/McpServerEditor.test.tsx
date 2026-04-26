import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import McpServerEditor from "@/application/components/agent/McpServerEditor";
import type { McpServerConfig } from "@/domain/entities/agent/mcpServerConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

const stdioServer: McpServerConfig = {
  name: "fs-server",
  transport: McpTransportType.STDIO,
  command: "npx",
  args: ["-y", "@mcp/filesystem"],
  headers: {},
  env: {},
};

const httpServer: McpServerConfig = {
  name: "http-server",
  transport: McpTransportType.HTTP,
  url: "http://localhost:3000/mcp",
  args: [],
  headers: { Authorization: "Bearer token" },
  env: {},
};

describe("McpServerEditor", () => {
  it("renders server name field", () => {
    renderWithProviders(
      <McpServerEditor
        value={stdioServer}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("fs-server")).toBeInTheDocument();
  });

  it("shows command field for stdio transport", () => {
    renderWithProviders(
      <McpServerEditor
        value={stdioServer}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/command/i)).toBeInTheDocument();
    expect(screen.getByText("Args")).toBeInTheDocument();
  });

  it("shows url field for http transport", () => {
    renderWithProviders(
      <McpServerEditor
        value={httpServer}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    expect(screen.getByText("Headers")).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    renderWithProviders(
      <McpServerEditor
        value={stdioServer}
        onChange={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: /remove server/i }));
    expect(onRemove).toHaveBeenCalled();
  });
});
