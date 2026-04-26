import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";

const { mockCreateAgentMutate } = vi.hoisted(() => {
  return {
    mockCreateAgentMutate: vi.fn(),
  };
});

vi.mock("@/application/hooks/agent/useCreateAgent", () => ({
  useCreateAgent: () => ({
    mutate: mockCreateAgentMutate,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/application/lib/yaml", () => ({
  agentConfigToYamlFile: vi.fn(
    () => new File(["yaml"], "test.yaml", { type: "application/x-yaml" }),
  ),
  serializeAgentConfig: vi.fn(() => "name: test"),
  parseAgentConfig: vi.fn(),
}));

import CreateAgentDialog from "@/application/components/agent/CreateAgentDialog";

describe("CreateAgentDialog", () => {
  beforeEach(() => {
    mockCreateAgentMutate.mockClear();
  });

  it("returns null when open is false", () => {
    const { container } = renderWithProviders(
      <CreateAgentDialog open={false} onOpenChange={vi.fn()} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders dialog title when open", () => {
    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("Create Agent")).toBeInTheDocument();
  });

  it("has form and yaml tabs", () => {
    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("Upload YAML")).toBeInTheDocument();
  });

  it("defaults to form tab", () => {
    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
  });

  it("switches to yaml tab and shows file input", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    await user.click(screen.getByText("Upload YAML"));

    expect(screen.getByLabelText(/yaml configuration/i)).toBeInTheDocument();
  });

  it("shows cancel button in yaml tab", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={onOpenChange} />,
    );

    await user.click(screen.getByText("Upload YAML"));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
