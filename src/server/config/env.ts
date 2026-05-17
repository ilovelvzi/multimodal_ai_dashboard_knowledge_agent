export type StorageDriver = "local" | "s3";

export type AppEnv = {
  nodeEnv: "development" | "test" | "production";
  appUrl: string;
  databaseUrl: string;
  storageDriver: StorageDriver;
  uploadsDir: string;
  openAiApiKey?: string;
  anthropicApiKey?: string;
};

const FALLBACK_DATABASE_URL =
  "postgres://postgres:postgres@localhost:5432/multimodal_ai_dashboard";

export function getServerEnv(): AppEnv {
  const nodeEnv =
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test"
      ? process.env.NODE_ENV
      : "development";

  const storageDriver = process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";

  return {
    nodeEnv,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    databaseUrl: process.env.DATABASE_URL ?? FALLBACK_DATABASE_URL,
    storageDriver,
    uploadsDir: process.env.UPLOADS_DIR ?? "./uploads",
    openAiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  };
}
