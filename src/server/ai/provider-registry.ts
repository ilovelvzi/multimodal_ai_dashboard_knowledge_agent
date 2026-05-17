import { getServerEnv } from "@/server/config/env";
import { getDefaultModel, listSupportedModels } from "@/server/ai/models";

type CompletionInput = {
  modelId?: string;
  prompt: string;
  systemPrompt: string;
};

function chunkText(text: string, size = 1600) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += size) {
    chunks.push(text.slice(index, index + size));
  }
  return chunks;
}

async function requestOpenAiCompatibleCompletion(input: CompletionInput) {
  const model = resolveModel(input.modelId);
  if (!model.apiKey) {
    return null;
  }

  const response = await fetch(`${model.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify({
      model: model.apiModel,
      stream: false,
      temperature: 0.2,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`provider_request_failed:${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

export function resolveModel(modelId?: string) {
  return listSupportedModels().find((model) => model.id === modelId) ?? getDefaultModel();
}

export function getProviderSummary() {
  return listSupportedModels().map((model) => ({
    id: model.id,
    provider: model.label,
    focus: model.focus,
    readiness: model.readiness,
    configured: Boolean(model.apiKey),
  }));
}

export async function generateModelAnswer(input: CompletionInput & { fallback: string }) {
  try {
    const completion = await requestOpenAiCompatibleCompletion(input);
    if (completion) {
      return completion;
    }
  } catch {
    return input.fallback;
  }

  return input.fallback;
}

export function buildFallbackAnswer(prompt: string, references: string[]) {
  const env = getServerEnv();
  const referenceText = references.length ? references.join("\n") : "当前知识库暂无已索引文档，已回退到 MVP 占位知识。";

  return [
    "这是基于当前 MVP 数据层生成的回答。",
    `系统已按 ${env.embeddingModel} / ${env.rerankModel} 的配置路径完成检索编排。`,
    "可用上下文：",
    referenceText,
    "用户问题：",
    prompt,
  ].join("\n\n");
}

export function chunkResponseText(text: string) {
  return chunkText(text, 28);
}
