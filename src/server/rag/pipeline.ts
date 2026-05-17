import type { RagAnswer } from "@/server/rag/types";
import { buildRagAnswer as buildKnowledgeRagAnswer } from "@/server/knowledge/service";

export async function buildRagAnswer(message: string, knowledgeBaseId?: string): Promise<RagAnswer> {
  return buildKnowledgeRagAnswer(message, knowledgeBaseId);
}
