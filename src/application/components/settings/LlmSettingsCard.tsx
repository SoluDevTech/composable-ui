import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/application/components/ui/select";
import { useLlmSettings } from "@/application/hooks/settings/useLlmSettings";

const LLM_PROVIDERS = ["openai", "openrouter", "litellm", "custom"] as const;
type LlmProvider = (typeof LLM_PROVIDERS)[number];

const PROVIDER_DEFAULTS: Readonly<Record<LlmProvider, string>> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  litellm: "",
  custom: "",
};

const PROVIDERS = LLM_PROVIDERS;

const LlmSchema = z.object({
  provider: z.enum(LLM_PROVIDERS),
  base_url: z.string().url().or(z.literal("")),
  api_key: z.string().min(1, "API key is required"),
});

type LlmFormValues = z.infer<typeof LlmSchema>;

export interface LlmSettingsCardProps {
  readonly odId?: string;
}

export default function LlmSettingsCard({ odId = "settings-llm" }: LlmSettingsCardProps) {
  const { settings, isLoading, isError, error, upsert, remove, isUpserting, isRemoving } =
    useLlmSettings();
  const [providerDraft, setProviderDraft] = useState<LlmFormValues["provider"]>("openai");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LlmFormValues>({
    resolver: zodResolver(LlmSchema),
    defaultValues: {
      provider: "openai",
      base_url: PROVIDER_DEFAULTS.openai,
      api_key: "",
    },
    mode: "onSubmit",
  });

  // Re-sync the form whenever the backend settings change (initial load or refetch).
  // Depend on primitive values — NOT on the `settings` object identity, which would
  // change every render and cause a reset → re-render loop. `updated_at` is the
  // canonical "settings changed" signal from the backend.
  const settingsProvider = settings?.provider as LlmProvider | undefined;
  const settingsBaseUrl = settings?.base_url;
  const settingsUpdatedAt = settings?.updated_at;
  useEffect(() => {
    const provider = settingsProvider ?? "openai";
    reset({
      provider,
      base_url: settingsBaseUrl ?? PROVIDER_DEFAULTS.openai,
      api_key: "",
    });
    setProviderDraft(provider);
  }, [settingsProvider, settingsBaseUrl, settingsUpdatedAt, reset]);

  const baseUrl = watch("base_url");

  function onProviderChange(value: LlmProvider) {
    setProviderDraft(value);
    setValue("provider", value);
    const next = PROVIDER_DEFAULTS[value];
    const isDefaultUrl = Object.values(PROVIDER_DEFAULTS).includes(baseUrl);
    if (next && (!baseUrl || isDefaultUrl)) {
      setValue("base_url", next);
    }
  }

  async function onSubmit(values: LlmFormValues) {
    try {
      await upsert({
        provider: values.provider,
        base_url: values.base_url,
        api_key: values.api_key,
      });
      toast.success("LLM settings saved");
      reset({ ...values, api_key: "" });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to save LLM settings");
    }
  }

  async function onDelete() {
    try {
      await remove();
      toast.success("LLM settings deleted");
      reset({ provider: "openai", base_url: PROVIDER_DEFAULTS.openai, api_key: "" });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to delete LLM settings");
    }
  }

  if (isLoading) {
    return (
      <section className="flex flex-col border border-border bg-surface" data-od-id={odId}>
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-sm uppercase tracking-[0.06em] text-fg">LLM Provider</h2>
        </div>
        <div className="p-5">
          <p className="font-mono text-xs text-muted" data-od-id="settings-llm-loading">
            Loading LLM settings…
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col border border-border bg-surface" data-od-id={odId}>
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-sm uppercase tracking-[0.06em] text-fg">LLM Provider</h2>
      </div>
      <form
        className="flex flex-col gap-4 p-5"
        data-od-id="settings-llm-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="settings-llm-provider"
            className="font-mono text-xs uppercase tracking-[0.1em] text-muted"
          >
            Provider
          </label>
          <Select value={providerDraft} onValueChange={onProviderChange}>
            <SelectTrigger
              id="settings-llm-provider"
              data-od-id="settings-llm-provider"
              aria-label="LLM provider"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="settings-llm-base-url"
            className="font-mono text-xs uppercase tracking-[0.1em] text-muted"
          >
            Base URL
          </label>
          <Input
            id="settings-llm-base-url"
            data-od-id="settings-llm-base-url"
            type="url"
            placeholder="https://api.openai.com/v1"
            autoComplete="off"
            {...register("base_url")}
          />
          {errors.base_url ? (
            <p className="font-mono text-xs text-danger">{errors.base_url.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="settings-llm-api-key"
            className="font-mono text-xs uppercase tracking-[0.1em] text-muted"
          >
            API Key
          </label>
          <Input
            id="settings-llm-api-key"
            data-od-id="settings-llm-api-key"
            type="password"
            placeholder="sk-..."
            autoComplete="off"
            {...register("api_key")}
          />
          {errors.api_key ? (
            <p className="font-mono text-xs text-danger">{errors.api_key.message}</p>
          ) : null}
          {settings?.api_key_masked ? (
            <p className="font-mono text-xs text-muted" data-od-id="settings-llm-key-masked">
              Current key: {settings.api_key_masked}
            </p>
          ) : (
            <p className="font-mono text-xs text-muted">
              Stored encrypted on the server. Leave blank to keep the existing key.
            </p>
          )}
        </div>

        {isError ? (
          <p className="font-mono text-xs text-danger" role="alert">
            {error?.message ?? "Failed to load LLM settings"}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isUpserting} data-od-id="settings-llm-save">
            {isUpserting ? "Saving…" : "Save LLM settings"}
          </Button>
          {settings ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isRemoving}
              data-od-id="settings-llm-delete"
              onClick={onDelete}
            >
              {isRemoving ? "Deleting…" : "Delete LLM settings"}
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
