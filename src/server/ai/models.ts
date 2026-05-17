import { modelCatalog } from "@/lib/catalog";
import { getServerEnv } from "@/server/config/env";

export type ProviderId = "deepseek" | "qwen";

export type ProviderModelConfig = {
  id: string;
  providerId: ProviderId;
  label: string;
  apiModel: string;
  baseUrl: string;
  apiKey?: string;
  focus: string;
  readiness: "ready" | "planned" | "scaffolded";
};

export function listSupportedModels(): ProviderModelConfig[] {
  const env = getServerEnv();

  return [
    {
      id: modelCatalog[0].id,
      providerId: "deepseek",
      label: modelCatalog[0].label,
      apiModel: env.providers.deepseek.model,
      baseUrl: env.providers.deepseek.baseUrl,
      apiKey: env.providers.deepseek.apiKey,
      focus: modelCatalog[0].focus,
      readiness: modelCatalog[0].readiness,
    },
    {
      id: modelCatalog[1].id,
      providerId: "qwen",
      label: modelCatalog[1].label,
      apiModel: env.providers.qwen.model,
      baseUrl: env.providers.qwen.baseUrl,
      apiKey: env.providers.qwen.apiKey,
      focus: modelCatalog[1].focus,
      readiness: modelCatalog[1].readiness,
    },
  ];
}

export function getDefaultModel() {
  return listSupportedModels()[0];
}
