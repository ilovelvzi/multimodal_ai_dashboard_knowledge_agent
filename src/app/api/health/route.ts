import { getServerEnv } from "@/server/config/env";
import { appManifest } from "@/server/services/app-manifest";
import { createLogEntry } from "@/server/services/logger";

export async function GET() {
  const env = getServerEnv();

  return Response.json({
    status: "ok",
    app: appManifest.name,
    mode: env.nodeEnv,
    storageDriver: env.storageDriver,
    timestamp: new Date().toISOString(),
    log: createLogEntry("info", "health", "Health endpoint requested"),
  });
}
