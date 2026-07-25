import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import { SkillCard } from "@/application/components/skill/SkillCard";

describe("SkillCard", () => {
  it("renders skill name", () => {
    renderWithProviders(<SkillCard name="rag" description="RAG queries" onConfigure={vi.fn()} />);

    expect(screen.getByText("rag")).toBeInTheDocument();
  });

  it("renders skill description", () => {
    renderWithProviders(<SkillCard name="rag" description="RAG queries" onConfigure={vi.fn()} />);

    expect(screen.getByText("RAG queries")).toBeInTheDocument();
  });

  it("calls onConfigure when Configure button is clicked", async () => {
    const user = userEvent.setup();
    const onConfigure = vi.fn();

    renderWithProviders(
      <SkillCard name="rag" description="RAG queries" onConfigure={onConfigure} />,
    );

    await user.click(screen.getByRole("button", { name: /configure/i }));

    expect(onConfigure).toHaveBeenCalledOnce();
    expect(onConfigure).toHaveBeenCalledWith("rag");
  });
});
