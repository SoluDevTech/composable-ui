import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";

const { mockCreateMemoryMutate } = vi.hoisted(() => {
  return {
    mockCreateMemoryMutate: vi.fn(),
  };
});

vi.mock("@/application/hooks/memory/useCreateMemory", () => ({
  useCreateMemory: () => ({
    mutate: mockCreateMemoryMutate,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { CreateMemoryDialog } from "@/application/components/memory/CreateMemoryDialog";

describe("CreateMemoryDialog", () => {
  beforeEach(() => {
    mockCreateMemoryMutate.mockClear();
  });

  it("renders name input", () => {
    renderWithProviders(<CreateMemoryDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("renders content textarea", () => {
    renderWithProviders(<CreateMemoryDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
  });

  it("renders Create button", () => {
    renderWithProviders(<CreateMemoryDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when Cancel clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(<CreateMemoryDialog open={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
