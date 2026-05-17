import { agentCatalog, knowledgeBaseCatalog } from "@/lib/catalog";
import { resolveModel } from "@/server/ai/provider-registry";
import { buildRagAnswer } from "@/server/rag/pipeline";

type ChatRequestBody = {
  message?: string;
  modelId?: string;
  knowledgeBaseId?: string;
  agentId?: string;
  fileNames?: string[];
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody;
  const message = body.message?.trim();

  if (!message) {
    return Response.json({ error: "message_is_required" }, { status: 400 });
  }

  const model = resolveModel(body.modelId);
  const knowledgeBase =
    knowledgeBaseCatalog.find((item) => item.id === body.knowledgeBaseId) ?? knowledgeBaseCatalog[0];
  const agent = agentCatalog.find((item) => item.id === body.agentId) ?? agentCatalog[0];
  const ragAnswer = buildRagAnswer(message, knowledgeBase.id);
  const attachmentHint = body.fileNames?.length
    ? `已感知到 ${body.fileNames.length} 个附件占位：${body.fileNames.join("、")}。`
    : "当前未附带文件，文件上传链路已预留。";

  const responseText = [
    `模型：${model.label}。`,
    `Agent：${agent.name}。`,
    `知识库：${knowledgeBase.name}。`,
    attachmentHint,
    ragAnswer.summary,
    `下一步建议：先完成真实 Provider 接入，再把文档处理异步任务与向量检索服务替换进来。`,
  ].join(" ");

  const chunks = responseText.match(/.{1,28}/g) ?? [responseText];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`${JSON.stringify({ type: "delta", delta: chunk })}\n`));
        await sleep(45);
      }

      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "done",
            citations: ragAnswer.citations.map((citation) => ({
              title: citation.title,
              source: citation.source,
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
    },
  });
}
