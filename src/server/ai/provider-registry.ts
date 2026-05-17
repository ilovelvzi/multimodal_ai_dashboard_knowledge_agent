import { getDefaultModel, listSupportedModels } from "@/server/ai/models";

export function resolveModel(modelId?: string) {
  return listSupportedModels().find((model) => model.id === modelId) ?? getDefaultModel();
}

export function getProviderSummary() {
  return listSupportedModels().map((model) => ({
    id: model.id,
    provider: model.provider,
    focus: model.focus,
    readiness: model.readiness,
  }));
}
