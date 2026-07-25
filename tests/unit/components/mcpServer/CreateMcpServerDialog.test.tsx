import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";

// Hoisted mocks so the dialog can call them via the mocked hooks.
const { mockCreateMcpServerMutate, mockValidateMcpServerMutateAsync } = vi.hoisted(() => {
  return {
    mockCreateMcpServerMutate: vi.fn(),
    mockValidateMcpServerMutateAsync: vi.fn(),
  };
});

vi.mock("@/application/hooks/mcpServer/useCreateMcpServer", () => ({
  useCreateMcpServer: () => ({
    mutate: mockCreateMcpServerMutate,
    isPending: false,
  }),
}));

vi.mock("@/application/hooks/mcpServer/useUpdateMcpServer", () => ({
  useUpdateMcpServer: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/application/hooks/mcpServer/useValidateMcpServer", () => ({
  useValidateMcpServer: () => ({
    mutateAsync: mockValidateMcpServerMutateAsync,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { CreateMcpServerDialog } from "@/application/components/mcpServer/CreateMcpServerDialog";

describe("CreateMcpServerDialog", () => {
  beforeEach(() => {
    mockCreateMcpServerMutate.mockClear();
    mockValidateMcpServerMutateAsync.mockReset();
  });

  it("renders the dialog container with data-od-id when open", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    const dialog = document.querySelector('[data-od-id="create-mcp-server-dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog).toBeInTheDocument();
  });

  it("renders the name input", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("renders the url input", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
  });

  it("renders a headers key/value editor", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText(/^headers$/i)).toBeInTheDocument();
  });

  it("renders an env key/value editor", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText(/^env$/i)).toBeInTheDocument();
  });

  it("renders the auth_token password input", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    const token = screen.getByLabelText(/auth token|auth_token/i);
    expect(token).toBeInTheDocument();
    expect((token as HTMLInputElement).type).toBe("password");
  });

  it("renders the Test connection button", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /test connection/i })).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /create|save|submit/i })).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls useCreateMcpServer mutate with the form values on submit", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "weather");
    await user.type(screen.getByLabelText(/url/i), "https://example.com/mcp");

    await user.click(screen.getByRole("button", { name: /create|save|submit/i }));

    await waitFor(() => {
      expect(mockCreateMcpServerMutate).toHaveBeenCalledTimes(1);
    });

    const payload = mockCreateMcpServerMutate.mock.calls[0][0];
    expect(payload.name).toBe("weather");
    expect(payload.url).toBe("https://example.com/mcp");
  });

  it("shows a success message with the tool count after a successful Test connection", async () => {
    mockValidateMcpServerMutateAsync.mockResolvedValue({ tool_count: 7 });
    const user = userEvent.setup();

    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "weather");
    await user.type(screen.getByLabelText(/url/i), "https://example.com/mcp");

    await user.click(screen.getByRole("button", { name: /test connection/i }));

    await waitFor(() => {
      expect(mockValidateMcpServerMutateAsync).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(screen.getByText(/7 tools/i)).toBeInTheDocument();
    });
  });

  it("shows an error message after a failed Test connection", async () => {
    mockValidateMcpServerMutateAsync.mockRejectedValue(new Error("Server unreachable"));
    const user = userEvent.setup();

    renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "weather");
    await user.type(screen.getByLabelText(/url/i), "https://example.com/mcp");

    await user.click(screen.getByRole("button", { name: /test connection/i }));

    await waitFor(() => {
      expect(mockValidateMcpServerMutateAsync).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(screen.getByText(/unreachable|error/i)).toBeInTheDocument();
    });
  });

  describe("source type selection", () => {
    it("renders a Type select with data-od-id=mcp-source-type", () => {
      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      const typeSelect = document.querySelector('[data-od-id="mcp-source-type"]');
      expect(typeSelect).not.toBeNull();
      expect(typeSelect).toBeInTheDocument();
    });

    it("offers External and OpenAPI options in the Type select", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      await user.click(screen.getByRole("combobox", { name: /type/i }));

      await waitFor(() => {
        expect(screen.getByRole("option", { name: /external/i })).toBeInTheDocument();
      });
      expect(screen.getByRole("option", { name: /openapi/i })).toBeInTheDocument();
    });

    it("defaults to External and shows url, env and auth_token fields", () => {
      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      // External is the default — url + env + auth_token visible.
      expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
      expect(screen.getByText(/^env$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/auth token|auth_token/i)).toBeInTheDocument();
      // openapi_url is NOT rendered for external.
      expect(screen.queryByLabelText(/openapi url|openapi_url/i)).not.toBeInTheDocument();
    });

    it("shows openapi_url and hides env + auth_token when OpenAPI is selected", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      await user.click(screen.getByRole("combobox", { name: /type/i }));
      await user.click(screen.getByRole("option", { name: /openapi/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/openapi url|openapi_url/i)).toBeInTheDocument();
      });
      // env + auth_token hidden for openapi.
      expect(screen.queryByText(/^env$/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/auth token|auth_token/i)).not.toBeInTheDocument();
    });

    it("shows url + env + auth_token again when switching back to External", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      // Switch to OpenAPI first.
      await user.click(screen.getByRole("combobox", { name: /type/i }));
      await user.click(screen.getByRole("option", { name: /openapi/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/openapi url|openapi_url/i)).toBeInTheDocument();
      });

      // Switch back to External.
      await user.click(screen.getByRole("combobox", { name: /type/i }));
      await user.click(screen.getByRole("option", { name: /external/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/^env$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/auth token|auth_token/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/openapi url|openapi_url/i)).not.toBeInTheDocument();
    });

    it("calls validate with source_type openapi and openapi_url on Test connection (OpenAPI mode)", async () => {
      mockValidateMcpServerMutateAsync.mockResolvedValue({ tool_count: 4 });
      const user = userEvent.setup();

      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      await user.type(screen.getByLabelText(/name/i), "petstore");
      // Switch to OpenAPI.
      await user.click(screen.getByRole("combobox", { name: /type/i }));
      await user.click(screen.getByRole("option", { name: /openapi/i }));

      await user.type(
        screen.getByLabelText(/openapi url|openapi_url/i),
        "https://example.com/openapi.json",
      );

      await user.click(screen.getByRole("button", { name: /test connection/i }));

      await waitFor(() => {
        expect(mockValidateMcpServerMutateAsync).toHaveBeenCalledOnce();
      });

      const payload = mockValidateMcpServerMutateAsync.mock.calls[0][0];
      expect(payload.source_type).toBe("openapi");
      expect(payload.openapi_url).toBe("https://example.com/openapi.json");
      expect(payload.name).toBe("petstore");
      // openapi sends null for url and auth_token (not empty strings).
      expect(payload.url).toBeNull();
      expect(payload.auth_token).toBeNull();
    });

    it("calls create with source_type openapi and openapi_url on submit (OpenAPI mode)", async () => {
      const user = userEvent.setup();

      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      await user.type(screen.getByLabelText(/name/i), "petstore");
      // Switch to OpenAPI.
      await user.click(screen.getByRole("combobox", { name: /type/i }));
      await user.click(screen.getByRole("option", { name: /openapi/i }));

      await user.type(
        screen.getByLabelText(/openapi url|openapi_url/i),
        "https://example.com/openapi.json",
      );

      await user.click(screen.getByRole("button", { name: /create|save|submit/i }));

      await waitFor(() => {
        expect(mockCreateMcpServerMutate).toHaveBeenCalledTimes(1);
      });

      const payload = mockCreateMcpServerMutate.mock.calls[0][0];
      expect(payload.source_type).toBe("openapi");
      expect(payload.openapi_url).toBe("https://example.com/openapi.json");
      expect(payload.name).toBe("petstore");
      // openapi sends null for url and auth_token (not empty strings).
      expect(payload.url).toBeNull();
      expect(payload.auth_token).toBeNull();
    });

    it("calls create with source_type external on submit (External mode default)", async () => {
      const user = userEvent.setup();

      renderWithProviders(<CreateMcpServerDialog open={true} onOpenChange={vi.fn()} />);

      await user.type(screen.getByLabelText(/name/i), "weather");
      await user.type(screen.getByLabelText(/url/i), "https://example.com/mcp");

      await user.click(screen.getByRole("button", { name: /create|save|submit/i }));

      await waitFor(() => {
        expect(mockCreateMcpServerMutate).toHaveBeenCalledTimes(1);
      });

      const payload = mockCreateMcpServerMutate.mock.calls[0][0];
      expect(payload.source_type).toBe("external");
      expect(payload.openapi_url).toBeNull();
      expect(payload.url).toBe("https://example.com/mcp");
    });
  });
});
