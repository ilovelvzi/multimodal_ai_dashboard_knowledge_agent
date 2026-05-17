import path from "node:path";
import type { DocumentProcessStage } from "@/server/config/mvp";
import { createId, ensureUploadsDir, readJsonFile, writeJsonFile } from "@/server/storage/fs";
import type { UserRole } from "@/server/auth/session";

export type ChatRecord = {
  id: string;
  userId: string;
  title: string;
  modelId: string;
  knowledgeBaseId?: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredCitation = {
  title: string;
  source: string;
  excerpt: string;
  score?: number;
};

export type ChatMessageRecord = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  citations: StoredCitation[];
  createdAt: string;
};

export type StoredDocument = {
  id: string;
  knowledgeBaseId: string;
  fileName: string;
  fileType: string;
  storageKey: string;
  status: DocumentProcessStage;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type StoredChunk = {
  id: string;
  documentId: string;
  knowledgeBaseId: string;
  chunkIndex: number;
  content: string;
  tokens: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type StoredEmbedding = {
  id: string;
  chunkId: string;
  model: string;
  dimensions: number;
  embedding: number[];
  createdAt: string;
  updatedAt: string;
};

export type StoredDataset = {
  id: string;
  name: string;
  sourceType: string;
  fileName: string;
  schemaSnapshot: Record<string, unknown>;
  metadata: Record<string, unknown>;
  previewRows: Array<Record<string, string | number | null>>;
  reportMarkdown: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredAuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type MvpStore = {
  chats: ChatRecord[];
  chatMessages: ChatMessageRecord[];
  documents: StoredDocument[];
  chunks: StoredChunk[];
  embeddings: StoredEmbedding[];
  dashboardDatasets: StoredDataset[];
};

const defaultStore: MvpStore = {
  chats: [],
  chatMessages: [],
  documents: [],
  chunks: [],
  embeddings: [],
  dashboardDatasets: [],
};

async function getStorePath() {
  const dataDir = await ensureUploadsDir("data");
  return path.join(dataDir, "mvp-store.json");
}

export async function readStore() {
  return readJsonFile(await getStorePath(), defaultStore);
}

export async function writeStore(store: MvpStore) {
  await writeJsonFile(await getStorePath(), store);
}

export async function updateStore<T>(mutate: (store: MvpStore) => T | Promise<T>) {
  const store = await readStore();
  const result = await mutate(store);
  await writeStore(store);
  return result;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createChatRecord(input: Omit<ChatRecord, "id" | "createdAt" | "updatedAt">): ChatRecord {
  const timestamp = nowIso();
  return {
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
}
