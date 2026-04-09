import { AppConfig } from "@/domain/entities/config/appConfig";

export interface IConfigRepository {
  getConfig(): Promise<AppConfig>;
  isLoaded(): boolean;
}
