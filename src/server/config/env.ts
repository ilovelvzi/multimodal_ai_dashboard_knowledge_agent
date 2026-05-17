import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  STORAGE_DRIVER: z.enum(["local", "s3"]).optional(),
  UPLOADS_DIR: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_ADMIN_EMAIL: z.email().optional(),
  AUTH_ADMIN_PASSWORD: z.string().min(8).optional(),
  AUTH_MEMBER_EMAIL: z.email().optional(),
  AUTH_MEMBER_PASSWORD: z.string().min(8).optional(),
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  DEEPSEEK_BASE_URL: z.string().url().optional(),
  DEEPSEEK_MODEL: z.string().min(1).optional(),
  QWEN_API_KEY: z.string().min(1).optional(),
  QWEN_BASE_URL: z.string().url().optional(),
  QWEN_MODEL: z.string().min(1).optional(),
  EMBEDDING_MODEL: z.string().min(1).optional(),
  RERANK_MODEL: z.string().min(1).optional(),
  KNOWLEDGE_EMBED_DIMENSIONS: z.coerce.number().int().positive().optional(),
  CHAT_STREAM_DELAY_MS: z.coerce.number().int().nonnegative().optional(),
});

export type StorageDriver = "local" | "s3";

export type AppEnv = {
  nodeEnv: "development" | "test" | "production";
  appUrl: string;
  databaseUrl: string;
  storageDriver: StorageDriver;
  uploadsDir: string;
  authSecret: string;
  nextAuthUrl: string;
  authUsers: Array<{
    id: string;
    email: string;
    name: string;
    password: string;
    role: "admin" | "member";
  }>;
  providers: {
    deepseek: {
      apiKey?: string;
      baseUrl: string;
      model: string;
    };
    qwen: {
      apiKey?: string;
      baseUrl: string;
      model: string;
    };
  };
  embeddingModel: string;
  rerankModel: string;
  embeddingDimensions: number;
  chatStreamDelayMs: number;
};

const FALLBACK_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/multimodal_ai_dashboard";
const FALLBACK_AUTH_SECRET = "local-development-auth-secret-please-change";

let cachedEnv: AppEnv | null = null;

export function getServerEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.parse(process.env);
  const nodeEnv = parsed.NODE_ENV ?? "development";

  cachedEnv = {
    nodeEnv,
    appUrl: parsed.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    databaseUrl: parsed.DATABASE_URL ?? FALLBACK_DATABASE_URL,
    storageDriver: parsed.STORAGE_DRIVER ?? "local",
    uploadsDir: parsed.UPLOADS_DIR ?? "./uploads",
    authSecret: parsed.AUTH_SECRET ?? FALLBACK_AUTH_SECRET,
    nextAuthUrl: parsed.NEXTAUTH_URL ?? parsed.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    authUsers: [
      {
        id: "demo-admin",
        email: parsed.AUTH_ADMIN_EMAIL ?? "admin@example.com",
        name: "Demo Admin",
        password: parsed.AUTH_ADMIN_PASSWORD ?? "ChangeMe123!",
        role: "admin",
      },
      {
        id: "demo-member",
        email: parsed.AUTH_MEMBER_EMAIL ?? "member@example.com",
        name: "Demo Member",
        password: parsed.AUTH_MEMBER_PASSWORD ?? "ChangeMe123!",
        role: "member",
      },
    ],
    providers: {
      deepseek: {
        apiKey: parsed.DEEPSEEK_API_KEY,
        baseUrl: parsed.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
        model: parsed.DEEPSEEK_MODEL ?? "deepseek-chat",
      },
      qwen: {
        apiKey: parsed.QWEN_API_KEY,
        baseUrl: parsed.QWEN_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: parsed.QWEN_MODEL ?? "qwen-plus",
      },
    },
    embeddingModel: parsed.EMBEDDING_MODEL ?? "text-embedding-v3",
    rerankModel: parsed.RERANK_MODEL ?? "gte-rerank",
    embeddingDimensions: parsed.KNOWLEDGE_EMBED_DIMENSIONS ?? 1536,
    chatStreamDelayMs: parsed.CHAT_STREAM_DELAY_MS ?? 35,
  };

  return cachedEnv;
}
