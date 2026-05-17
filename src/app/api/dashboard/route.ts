import { requireSession } from "@/server/auth/session";
import { listDashboardDatasets, uploadDashboardDataset } from "@/server/dashboard/service";
import { dashboardUploadSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireSession();
  return Response.json(await listDashboardDatasets());
}

export async function POST(request: Request) {
  await requireSession();
  const formData = await request.formData();
  const parsed = dashboardUploadSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "file_is_required" }, { status: 400 });
  }

  const dataset = await uploadDashboardDataset(parsed.data.name, file);
  return Response.json(dataset, { status: 201 });
}
