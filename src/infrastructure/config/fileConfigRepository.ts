import { toast } from "sonner";
import { AppConfig, AppConfigSchema } from "@/domain/entities/config/appConfig";
import { IConfigRepository } from "@/domain/ports/config/configRepository";

export class FileConfigRepository implements IConfigRepository {
  private config: AppConfig | null = null;
  private configPromise: Promise<AppConfig> | null = null;

  async getConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.configPromise !== null) {
      return this.configPromise;
    }

    this.configPromise = this.fetchConfig();
    return this.configPromise;
  }

  private async fetchConfig(): Promise<AppConfig> {
    try {
      const response = await fetch("/config.json");
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }

      const rawConfig = await response.json();
      const config = AppConfigSchema.parse(rawConfig);
      this.config = config;
      return config;
    } catch (error) {
      this.configPromise = null;
      console.error("Config loading failed:", error);
      toast.error("Configuration Error", {
        description: "App is not configured.",
      });
      throw error;
    }
  }

  isLoaded(): boolean {
    return this.config !== null;
  }
}
