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

    renderWithProviders(<WorkspaceSelector value="" onChange={vi.fn()} folders={folders} />);

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

    renderWithProviders(<WorkspaceSelector value="" onChange={onChange} folders={folders} />);

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);
    await user.type(input, "/data");

    await user.click(screen.getByText("/data/project-a/"));
    expect(onChange).toHaveBeenCalledWith("/data/project-a/");
  });

  it("free text input also works — calls onChange on change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(<WorkspaceSelector value="" onChange={onChange} folders={[]} />);

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);
    await user.type(input, "/custom/path");

    expect(onChange).toHaveBeenCalled();
  });

  // ─── a11y: combobox keyboard navigation ──────────────────────────────────

  it("ArrowDown moves active suggestion down", async () => {
    const user = userEvent.setup();
    const folders = ["/data/project-a/", "/data/project-b/"];

    renderWithProviders(<WorkspaceSelector value="" onChange={vi.fn()} folders={folders} />);

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);

    // Listbox is open with options.
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);

    await user.keyboard("{ArrowDown}");

    // First option should be highlighted as active.
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowUp wraps to last suggestion from first", async () => {
    const user = userEvent.setup();
    const folders = ["/data/project-a/", "/data/project-b/"];

    renderWithProviders(<WorkspaceSelector value="" onChange={vi.fn()} folders={folders} />);

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);
    await user.keyboard("{ArrowUp}");

    const options = screen.getAllByRole("option");
    // ArrowUp from position -1 wraps to the last item.
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("Enter commits the highlighted suggestion and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const folders = ["/data/project-a/", "/data/project-b/"];

    renderWithProviders(<WorkspaceSelector value="" onChange={onChange} folders={folders} />);

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    // First suggestion is active.
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    // Enter commits it.
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("/data/project-a/");
  });

  it("Escape closes the listbox", async () => {
    const user = userEvent.setup();
    const folders = ["/data/project-a/", "/data/project-b/"];

    renderWithProviders(<WorkspaceSelector value="" onChange={vi.fn()} folders={folders} />);

    const input = screen.getByLabelText(/workspace/i);
    await user.click(input);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("input has role=combobox and aria-controls pointing to listbox", async () => {
    const user = userEvent.setup();
    const folders = ["/data/project-a/"];

    renderWithProviders(<WorkspaceSelector value="" onChange={vi.fn()} folders={folders} />);

    const input = screen.getByLabelText(/workspace/i);
    expect(input).toHaveAttribute("role", "combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");

    await user.click(input);

    const listbox = screen.getByRole("listbox");
    const listboxId = listbox.getAttribute("id");
    expect(input.getAttribute("aria-controls")).toBe(listboxId);
  });
});
