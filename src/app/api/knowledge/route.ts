import { requireSession } from "@/server/auth/session";
import { listKnowledgeBases, listKnowledgeDocuments, uploadKnowledgeFiles } from "@/server/knowledge/service";
import { knowledgeUploadSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireSession();
  const knowledgeBaseId = new URL(request.url).searchParams.get("knowledgeBaseId") ?? undefined;
  const [knowledgeBases, documents] = await Promise.all([
    listKnowledgeBases(),
    listKnowledgeDocuments(knowledgeBaseId),
  ]);

  return Response.json({ knowledgeBases, documents });
}

export async function POST(request: Request) {
  await requireSession();
  const formData = await request.formData();
  const parsed = knowledgeUploadSchema.safeParse({
    knowledgeBaseId: formData.get("knowledgeBaseId"),
  });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!files.length) {
    return Response.json({ error: "files_are_required" }, { status: 400 });
  }

  const result = await uploadKnowledgeFiles(parsed.data.knowledgeBaseId, files);
  return Response.json(result, { status: result.accepted.length ? 202 : 400 });
}
