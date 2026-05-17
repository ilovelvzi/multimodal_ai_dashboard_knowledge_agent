import { getLatestKnowledgeProgress, subscribeKnowledgeProgress } from "@/server/knowledge/events";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  await requireSession();
  const { documentId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const latest = getLatestKnowledgeProgress(documentId);
      if (latest) {
        send(latest);
        if (latest.completed) {
          controller.close();
          return;
        }
      }

      const unsubscribe = subscribeKnowledgeProgress(documentId, (event) => {
        send(event);
        if (event.completed) {
          unsubscribe();
          controller.close();
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    },
  });
}
