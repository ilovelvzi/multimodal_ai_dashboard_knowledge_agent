import { knowledgeBaseCatalog } from "@/lib/catalog";
import type { RagAnswer } from "@/server/rag/types";

export function buildRagAnswer(message: string, knowledgeBaseId?: string): RagAnswer {
  const knowledgeBase =
    knowledgeBaseCatalog.find((item) => item.id === knowledgeBaseId) ?? knowledgeBaseCatalog[0];

  return {
    summary: `已根据“${knowledgeBase.name}”为你的问题生成 MVP 级参考回答：${message}`,
    steps: [
      "接收用户问题并归一化上下文。",
      "根据知识库配置选择向量检索集合。",
      "拼接检索片段并生成带引用回答。",
    ],
    citations: [
      {
        title: `${knowledgeBase.name} / onboarding.pdf`,
        excerpt: "建议先按客户分层筛选，再结合标准话术与最近一次跟进记录输出行动建议。",
        source: "p.12 · chunk-001",
      },
      {
        title: `${knowledgeBase.name} / faq.md`,
        excerpt: "在成本敏感场景中优先选择轻量模型，并记录 Token 与调用策略。",
        source: "section 2.3 · chunk-014",
      },
    ],
  };
}
