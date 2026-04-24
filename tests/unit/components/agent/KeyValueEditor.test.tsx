import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import KeyValueEditor from "@/application/components/agent/KeyValueEditor";

describe("KeyValueEditor", () => {
  it("renders with label and existing entries", () => {
    renderWithProviders(
      <KeyValueEditor
        label="Headers"
        value={{ Authorization: "Bearer token", "X-Custom": "value" }}
        onChange={vi.fn()}
        keyPlaceholder="Header name"
        valuePlaceholder="Header value"
      />,
    );

    expect(screen.getByText("Headers")).toBeInTheDocument();
    expect(screen.getByText("Authorization")).toBeInTheDocument();
    expect(screen.getByText("X-Custom")).toBeInTheDocument();
  });

  it("renders key and value inputs", () => {
    renderWithProviders(
      <KeyValueEditor
        label="Env"
        value={{}}
        onChange={vi.fn()}
        keyPlaceholder="Variable name"
        valuePlaceholder="Variable value"
      />,
    );

    expect(screen.getByPlaceholderText("Variable name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Variable value")).toBeInTheDocument();
  });

  it("calls onChange when adding a new entry", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <KeyValueEditor
        label="Headers"
        value={{}}
        onChange={onChange}
        keyPlaceholder="Key"
        valuePlaceholder="Value"
      />,
    );

    await user.type(screen.getByPlaceholderText("Key"), "API_KEY");
    await user.type(screen.getByPlaceholderText("Value"), "12345");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(onChange).toHaveBeenCalledWith({ API_KEY: "12345" });
  });

  it("calls onChange when removing an entry", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <KeyValueEditor
        label="Headers"
        value={{ Authorization: "Bearer token" }}
        onChange={onChange}
        keyPlaceholder="Key"
        valuePlaceholder="Value"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /remove authorization/i }),
    );

    expect(onChange).toHaveBeenCalledWith({});
  });

  it("does not add entry with empty key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <KeyValueEditor
        label="Headers"
        value={{}}
        onChange={onChange}
        keyPlaceholder="Key"
        valuePlaceholder="Value"
      />,
    );

    await user.type(screen.getByPlaceholderText("Value"), "some value");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
