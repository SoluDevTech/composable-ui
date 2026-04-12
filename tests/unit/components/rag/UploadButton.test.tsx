import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import UploadButton from "@/application/components/rag/UploadButton";

const { mockMutate, mockIsPending } = vi.hoisted(() => ({
  mockMutate: vi.fn(),
  mockIsPending: vi.fn().mockReturnValue(false),
}));

vi.mock("@/application/hooks/rag/useUploadFile", () => ({
  useUploadFile: () => ({
    mutate: mockMutate,
    isPending: mockIsPending(),
  }),
}));

describe("UploadButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending.mockReturnValue(false);
  });

  it("renders upload button with correct text", () => {
    renderWithProviders(
      <UploadButton prefix="documents/" onUploadComplete={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /upload/i }),
    ).toBeInTheDocument();
  });

  it("has a hidden file input", () => {
    renderWithProviders(
      <UploadButton prefix="documents/" onUploadComplete={vi.fn()} />,
    );

    const fileInput = screen.getByLabelText(/choose file/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("type", "file");
  });

  it("clicking button triggers file input click", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <UploadButton prefix="documents/" onUploadComplete={vi.fn()} />,
    );

    const fileInput = screen.getByLabelText(/choose file/i);
    const clickSpy = vi.spyOn(fileInput, "click");

    await user.click(screen.getByRole("button", { name: /upload/i }));

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("selecting a file triggers upload with correct prefix", async () => {
    const user = userEvent.setup();

    // Set up the mock mutate to call onSuccess callback
    mockMutate.mockImplementation((_args, options) => {
      options?.onSuccess?.();
    });

    renderWithProviders(
      <UploadButton prefix="documents/reports/" onUploadComplete={vi.fn()} />,
    );

    const file = new File(["dummy content"], "report.pdf", {
      type: "application/pdf",
    });
    const fileInput = screen.getByLabelText(/choose file/i);
    await user.upload(fileInput, file);

    expect(mockMutate).toHaveBeenCalledWith(
      { prefix: "documents/reports/", file },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("shows loading indicator during upload", () => {
    mockIsPending.mockReturnValue(true);

    renderWithProviders(
      <UploadButton prefix="documents/" onUploadComplete={vi.fn()} />,
    );

    expect(screen.getByTestId("upload-spinner")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /uploading/i }),
    ).toBeInTheDocument();
  });

  it("calls onUploadComplete on success", async () => {
    const user = userEvent.setup();
    const onUploadComplete = vi.fn();

    mockMutate.mockImplementation((_args, options) => {
      options?.onSuccess?.();
    });

    renderWithProviders(
      <UploadButton
        prefix="documents/"
        onUploadComplete={onUploadComplete}
      />,
    );

    const file = new File(["dummy content"], "report.pdf", {
      type: "application/pdf",
    });
    const fileInput = screen.getByLabelText(/choose file/i);
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledOnce();
    });
  });
});
