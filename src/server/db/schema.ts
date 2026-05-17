import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { vector } from "@/server/db/custom-types";

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);
export const documentStatusEnum = pgEnum("document_status", [
  "uploaded",
  "parsing",
  "chunking",
  "embedding",
  "indexing",
  "completed",
  "failed",
]);
export const runStatusEnum = pgEnum("run_status", ["queued", "running", "succeeded", "failed"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("member"),
  status: varchar("status", { length: 64 }).notNull().default("active"),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const chats = pgTable(
  "chats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    modelId: varchar("model_id", { length: 128 }).notNull(),
    knowledgeBaseId: uuid("knowledge_base_id"),
    agentId: uuid("agent_id"),
    contextSnapshot: jsonb("context_snapshot")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ...timestamps,
  },
  (table) => [index("chats_user_id_idx").on(table.userId)],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull(),
    content: text("content").notNull(),
    toolCalls: jsonb("tool_calls").$type<Record<string, unknown>[]>().notNull().default(sql`'[]'::jsonb`),
    citations: jsonb("citations").$type<Record<string, unknown>[]>().notNull().default(sql`'[]'::jsonb`),
    ...timestamps,
  },
  (table) => [index("chat_messages_chat_id_idx").on(table.chatId)],
);

export const knowledgeBases = pgTable("knowledge_bases", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  embeddingModel: varchar("embedding_model", { length: 128 }).notNull(),
  rerankModel: varchar("rerank_model", { length: 128 }).notNull().default("gte-rerank"),
  retrievalConfig: jsonb("retrieval_config")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  ...timestamps,
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    knowledgeBaseId: uuid("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 64 }).notNull(),
    storageKey: text("storage_key").notNull(),
    status: documentStatusEnum("status").notNull().default("uploaded"),
    chunkCount: integer("chunk_count").notNull().default(0),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    ...timestamps,
  },
  (table) => [index("documents_kb_id_idx").on(table.knowledgeBaseId)],
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    tokens: integer("tokens").notNull().default(0),
    pageNumber: integer("page_number"),
    sourcePath: text("source_path"),
    startOffset: integer("start_offset"),
    endOffset: integer("end_offset"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    ...timestamps,
  },
  (table) => [index("document_chunks_document_id_idx").on(table.documentId)],
);

export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chunkId: uuid("chunk_id")
      .notNull()
      .references(() => documentChunks.id, { onDelete: "cascade" }),
    model: varchar("model", { length: 128 }).notNull(),
    dimensions: integer("dimensions").notNull().default(1536),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    ...timestamps,
  },
  (table) => [index("embeddings_chunk_id_idx").on(table.chunkId)],
);

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  promptTemplate: text("prompt_template").notNull(),
  toolIds: jsonb("tool_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  memoryConfig: jsonb("memory_config").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  modelConfig: jsonb("model_config").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    status: runStatusEnum("status").notNull().default("queued"),
    input: jsonb("input").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    output: jsonb("output").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    ...timestamps,
  },
  (table) => [index("agent_runs_agent_id_idx").on(table.agentId)],
);

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  definition: jsonb("definition").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  isPublished: boolean("is_published").notNull().default(false),
  ...timestamps,
});

export const workflowRuns = pgTable(
  "workflow_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    status: runStatusEnum("status").notNull().default("queued"),
    input: jsonb("input").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    output: jsonb("output").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    ...timestamps,
  },
  (table) => [index("workflow_runs_workflow_id_idx").on(table.workflowId)],
);

export const dashboardDatasets = pgTable("dashboard_datasets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sourceType: varchar("source_type", { length: 64 }).notNull(),
  fileName: varchar("file_name", { length: 255 }),
  schemaSnapshot: jsonb("schema_snapshot")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  previewRows: jsonb("preview_rows").$type<Record<string, unknown>[]>().notNull().default(sql`'[]'::jsonb`),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  ...timestamps,
});

export const dashboardReports = pgTable(
  "dashboard_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => dashboardDatasets.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    reportMarkdown: text("report_markdown").notNull(),
    chartConfig: jsonb("chart_config").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    ...timestamps,
  },
  (table) => [index("dashboard_reports_dataset_id_idx").on(table.datasetId)],
);
