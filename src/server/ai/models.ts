import { modelCatalog } from "@/lib/catalog";

export function listSupportedModels() {
  return modelCatalog;
}

export function getDefaultModel() {
  return modelCatalog[0];
}
