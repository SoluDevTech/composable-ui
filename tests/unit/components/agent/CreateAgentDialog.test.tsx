import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import CreateAgentDialog from "@/application/components/agent/CreateAgentDialog";

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

  it("renders form with title when open", () => {
    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("Create Agent")).toBeInTheDocument();
  });

  it("has name input with label", () => {
    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
  });

  it("has YAML file input", () => {
    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByLabelText(/yaml configuration/i)).toBeInTheDocument();
  });

  it("has Create and Cancel buttons", () => {
    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onOpenChange when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={onOpenChange} />,
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("allows typing in the name input", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    const input = screen.getByLabelText(/agent name/i);
    await user.type(input, "my-new-agent");

    expect(input).toHaveValue("my-new-agent");
  });

  it("calls createAgent.mutate when form is submitted with name and file", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    // Type agent name
    await user.type(screen.getByLabelText(/agent name/i), "my-agent");

    // Upload a file
    const file = new File(["model: gpt-4o"], "config.yaml", {
      type: "application/x-yaml",
    });
    const fileInput = screen.getByLabelText(/yaml configuration/i);
    await user.upload(fileInput, file);

    // Submit
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    expect(mockCreateAgentMutate).toHaveBeenCalledWith(
      { name: "my-agent", yamlFile: file },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("shows error toast when name is empty on submit", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    // Submit without name
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    expect(toast.error).toHaveBeenCalledWith("Agent name is required");
    expect(mockCreateAgentMutate).not.toHaveBeenCalled();
  });

  it("shows error toast when file is not selected on submit", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={vi.fn()} />,
    );

    // Type name but don't upload file
    await user.type(screen.getByLabelText(/agent name/i), "my-agent");
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    expect(toast.error).toHaveBeenCalledWith(
      "YAML configuration file is required",
    );
    expect(mockCreateAgentMutate).not.toHaveBeenCalled();
  });

  it("closes dialog via header close button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <CreateAgentDialog open={true} onOpenChange={onOpenChange} />,
    );

    const allButtons = screen.getAllByRole("button");
    const headerClose = allButtons.find(
      (btn) => btn.textContent?.trim() === "close",
    );
    expect(headerClose).toBeDefined();
    await user.click(headerClose!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
