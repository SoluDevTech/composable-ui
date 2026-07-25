import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Input } from "@/application/components/ui/input";

describe("Input — modal overflow fix", () => {
  it("includes min-w-0 in its className", () => {
    const { container } = render(<Input />);

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.className).toMatch(/min-w-0/);
  });
});
