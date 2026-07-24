import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";

const { mockCreateSkillMutate } = vi.hoisted(() => {
  return {
    mockCreateSkillMutate: vi.fn(),
  };
});

vi.mock("@/application/hooks/skill/useCreateSkill", () => ({
  useCreateSkill: () => ({
    mutate: mockCreateSkillMutate,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { CreateSkillDialog } from "@/application/components/skill/CreateSkillDialog";

describe("CreateSkillDialog", () => {
  beforeEach(() => {
    mockCreateSkillMutate.mockClear();
  });

  it("renders name input", () => {
    renderWithProviders(
      <CreateSkillDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("renders description input", () => {
    renderWithProviders(
      <CreateSkillDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("renders content textarea", () => {
    renderWithProviders(
      <CreateSkillDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
  });

  it("renders Create button", () => {
    renderWithProviders(
      <CreateSkillDialog open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when Cancel clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <CreateSkillDialog open={true} onOpenChange={onOpenChange} />,
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});