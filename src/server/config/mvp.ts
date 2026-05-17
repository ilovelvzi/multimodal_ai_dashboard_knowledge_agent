export const KNOWLEDGE_DOCUMENT_TYPES = ["pdf", "md", "markdown", "docx", "txt"] as const;
export const DASHBOARD_DATA_TYPES = ["csv", "xlsx"] as const;

export const KNOWLEDGE_UPLOAD_ACCEPT = ".pdf,.md,.markdown,.docx,.txt";
export const DASHBOARD_UPLOAD_ACCEPT = ".csv,.xlsx";

export const KNOWLEDGE_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "text/markdown",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const DASHBOARD_MIME_TYPES = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const DOCUMENT_PROCESS_STAGES = [
  "uploaded",
  "parsing",
  "chunking",
  "embedding",
  "indexing",
  "completed",
  "failed",
] as const;

export type DocumentProcessStage = (typeof DOCUMENT_PROCESS_STAGES)[number];

export const RUN_STATUSES = ["queued", "running", "succeeded", "failed"] as const;

export const MAX_KNOWLEDGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_DASHBOARD_FILE_SIZE_BYTES = 8 * 1024 * 1024;
export const DEFAULT_CHUNK_SIZE = 900;
export const DEFAULT_CHUNK_OVERLAP = 180;
export const CHAT_HISTORY_LIMIT = 40;
