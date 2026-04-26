import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import WorkspaceSelector from "@/application/components/rag/WorkspaceSelector";

describe("WorkspaceSelector", () => {
  it("renders input with current value", () => {
    renderWithProviders(
      <WorkspaceSelector value="/data/project" onChange={vi.fn()} folders={[]} />,
    );

    const input = screen.getByLabelText(/workspace/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("/data/project");
  });

  it("shows folder suggestions when typing", async () => {
    const user = userEvent.setup();
    const folders = ["/data/project-a/", "/data/project-b/", "/other/docs/"];

    renderWithProviders(
      <WorkspaceSelector value="" onChange={vi.fn()} folders={folders} />,
    );

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);
    await user.type(input, "/data");

    expect(screen.getByText("/data/project-a/")).toBeInTheDocument();
    expect(screen.getByText("/data/project-b/")).toBeInTheDocument();
    expect(screen.queryByText("/other/docs/")).not.toBeInTheDocument();
  });

  it("calls onChange when a suggestion is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const folders = ["/data/project-a/", "/data/project-b/"];

    renderWithProviders(
      <WorkspaceSelector value="" onChange={onChange} folders={folders} />,
    );

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);
    await user.type(input, "/data");

    await user.click(screen.getByText("/data/project-a/"));
    expect(onChange).toHaveBeenCalledWith("/data/project-a/");
  });

  it("free text input also works — calls onChange on change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <WorkspaceSelector value="" onChange={onChange} folders={[]} />,
    );

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);
    await user.type(input, "/custom/path");

    expect(onChange).toHaveBeenCalled();
  });
});