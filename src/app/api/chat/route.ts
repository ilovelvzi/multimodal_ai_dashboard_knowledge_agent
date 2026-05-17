import { chunkResponseText, generateModelAnswer, resolveModel, buildFallbackAnswer } from "@/server/ai/provider-registry";
import { requireSession } from "@/server/auth/session";
import { CHAT_HISTORY_LIMIT } from "@/server/config/mvp";
import { getServerEnv } from "@/server/config/env";
import { buildRagAnswer } from "@/server/knowledge/service";
import { createId } from "@/server/storage/fs";
import { chatHistoryQuerySchema, chatRequestSchema } from "@/server/validation/schemas";
import { createChatRecord, readStore, updateStore, type ChatMessageRecord } from "@/server/store/mvp-store";

export const dynamic = "force-dynamic";

async function ensureChat(userId: string, modelId: string, knowledgeBaseId?: string, agentId?: string, chatId?: string) {
  return updateStore((store) => {
    const existing = store.chats.find((chat) => chat.id === chatId && chat.userId === userId);
    if (existing) {
      existing.updatedAt = new Date().toISOString();
      existing.modelId = modelId;
      existing.knowledgeBaseId = knowledgeBaseId;
      existing.agentId = agentId;
      return existing;
    }

    const latest = store.chats.find((chat) => chat.userId === userId);
    if (latest && !chatId) {
      latest.updatedAt = new Date().toISOString();
      latest.modelId = modelId;
      latest.knowledgeBaseId = knowledgeBaseId;
      latest.agentId = agentId;
      return latest;
    }

    const created = createChatRecord({
      userId,
      title: "新的知识问答",
      modelId,
      knowledgeBaseId,
      agentId,
    });
    store.chats.push(created);
    return created;
  });
}

async function listHistory(userId: string, limit: number) {
  const store = await readStore();
  const chat = store.chats.find((item) => item.userId === userId);
  if (!chat) {
    return { chatId: null, messages: [] as ChatMessageRecord[] };
  }

  const messages = store.chatMessages
    .filter((message) => message.chatId === chat.id)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .slice(-Math.min(limit, CHAT_HISTORY_LIMIT));

  return { chatId: chat.id, messages };
}

export async function GET(request: Request) {
  const session = await requireSession();
  const params = new URL(request.url).searchParams;
  const parsed = chatHistoryQuerySchema.safeParse({ limit: params.get("limit") ?? undefined });
  const history = await listHistory(session.user.id, parsed.success ? parsed.data.limit : 20);

  return Response.json(history);
}

export async function POST(request: Request) {
  const session = await requireSession();
  const body = await request.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const model = resolveModel(data.modelId);
  const ragAnswer = await buildRagAnswer(data.message, data.knowledgeBaseId);
  const chat = await ensureChat(session.user.id, model.id, data.knowledgeBaseId, data.agentId, data.chatId);

  const userMessage: ChatMessageRecord = {
    id: createId(),
    chatId: chat.id,
    role: "user",
    content: data.message,
    citations: [],
    createdAt: new Date().toISOString(),
  };

  await updateStore((store) => {
    store.chatMessages.push(userMessage);
    const target = store.chats.find((item) => item.id === chat.id);
    if (target) {
      target.title = data.message.slice(0, 40);
      target.updatedAt = new Date().toISOString();
    }
  });

  const fallback = buildFallbackAnswer(data.message, ragAnswer.context);
  const responseText = await generateModelAnswer({
    modelId: model.id,
    systemPrompt: [
      "你是企业知识库助手。",
      "回答必须基于给定上下文，保持简洁，并在结尾给出下一步建议。",
      `模型路由：${model.label}`,
      `检索流程：${ragAnswer.steps.join(" -> ")}`,
    ].join("\n"),
    prompt: [
      `用户角色：${session.user.role}`,
      `知识库上下文：\n${ragAnswer.context.join("\n---\n") || "暂无上下文"}`,
      `附件占位：${data.fileNames.join("、") || "无"}`,
      `用户问题：${data.message}`,
    ].join("\n\n"),
    fallback,
  });

  const citations = ragAnswer.citations;
  const assistantMessage: ChatMessageRecord = {
    id: createId(),
    chatId: chat.id,
    role: "assistant",
    content: responseText,
    citations: citations.map((citation) => ({
      title: citation.title,
      source: citation.source,
      excerpt: citation.excerpt,
      score: citation.score,
    })),
    createdAt: new Date().toISOString(),
  };

  await updateStore((store) => {
    store.chatMessages.push(assistantMessage);
  });

  const encoder = new TextEncoder();
  const chunks = chunkResponseText(responseText);
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`${JSON.stringify({ type: "delta", delta: chunk })}\n`));
        await new Promise((resolve) => setTimeout(resolve, getServerEnv().chatStreamDelayMs));
      }

      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "done",
            chatId: chat.id,
            citations: citations.map((citation) => ({
              title: citation.title,
              source: citation.source,
              excerpt: citation.excerpt,
              score: citation.score,
            })),
          })}\n`,
        ),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
