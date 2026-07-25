import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import JsonBlock from "@/application/components/chat/JsonBlock";

describe("JsonBlock", () => {
  it("pretty-prints a valid JSON string with 2-space indentation", () => {
    const content = '{"a":1,"b":[2,3]}';
    const expected = JSON.stringify(JSON.parse(content), null, 2);

    renderWithProviders(<JsonBlock content={content} />);

    const pre = document.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toBe(expected);
  });

  it("renders a non-JSON string as-is (fallback)", () => {
    renderWithProviders(<JsonBlock content="plain text result" />);

    const pre = document.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toContain("plain text result");
  });

  it("renders nothing when content is null", () => {
    renderWithProviders(<JsonBlock content={null} />);

    expect(document.querySelector('[data-od-id="json-block"]')).toBeNull();
    expect(document.querySelector("pre")).toBeNull();
  });

  it("Copy button copies the formatted JSON and shows a Copied state", async () => {
    const content = '{"a":1,"b":[2,3]}';
    const expectedFormatted = JSON.stringify(JSON.parse(content), null, 2);
    // userEvent.setup() installs a clipboard stub on navigator; spy on its
    // writeText AFTER setup so we assert the formatted payload is copied.
    const user = userEvent.setup();
    const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    renderWithProviders(<JsonBlock content={content} />);

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    await user.click(copyBtn);

    expect(writeTextSpy).toHaveBeenCalledWith(expectedFormatted);
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
    writeTextSpy.mockRestore();
  });

  it("has data-od-id=json-block on the wrapper", () => {
    renderWithProviders(<JsonBlock content='{"x":1}' />);

    expect(document.querySelector('[data-od-id="json-block"]')).not.toBeNull();
  });
});
