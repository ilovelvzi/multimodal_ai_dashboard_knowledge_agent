import { z } from "zod";
import {
  CHAT_HISTORY_LIMIT,
  DASHBOARD_DATA_TYPES,
  DOCUMENT_PROCESS_STAGES,
  KNOWLEDGE_DOCUMENT_TYPES,
  RUN_STATUSES,
} from "@/server/config/mvp";

export const userRoleSchema = z.enum(["admin", "member"]);
export const runStatusSchema = z.enum(RUN_STATUSES);
export const documentStageSchema = z.enum(DOCUMENT_PROCESS_STAGES);

export const loginFormSchema = z.object({
  email: z.email("请输入有效邮箱地址").trim(),
  password: z.string().min(8, "密码至少 8 位").trim(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, "message_is_required").max(4000).trim(),
  modelId: z.string().min(1).optional(),
  knowledgeBaseId: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  chatId: z.string().uuid().optional(),
  fileNames: z.array(z.string().min(1).max(255)).max(10).default([]),
});

export const knowledgeUploadSchema = z.object({
  knowledgeBaseId: z.string().min(1, "knowledge_base_is_required"),
});

export const dashboardUploadSchema = z.object({
  name: z.string().min(1, "name_is_required").max(255).trim(),
});

export const chatHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(CHAT_HISTORY_LIMIT).default(20),
});

export const documentTypeSchema = z.enum(KNOWLEDGE_DOCUMENT_TYPES);
export const datasetTypeSchema = z.enum(DASHBOARD_DATA_TYPES);
