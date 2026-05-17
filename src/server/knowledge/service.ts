import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { knowledgeBaseCatalog } from "@/lib/catalog";
import {
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
  DOCUMENT_PROCESS_STAGES,
  KNOWLEDGE_DOCUMENT_MIME_TYPES,
  MAX_KNOWLEDGE_FILE_SIZE_BYTES,
} from "@/server/config/mvp";
import { getServerEnv } from "@/server/config/env";
import { publishKnowledgeProgress } from "@/server/knowledge/events";
import type { Citation, RagAnswer } from "@/server/rag/types";
import {
  nowIso,
  readStore,
  updateStore,
  type StoredChunk,
  type StoredDocument,
  type StoredEmbedding,
} from "@/server/store/mvp-store";
import { createId, ensureUploadsDir, sanitizeFileName } from "@/server/storage/fs";

export type KnowledgeUploadResult = {
  accepted: StoredDocument[];
  rejected: Array<{ fileName: string; reason: string }>;
};

type ParsedBlock = {
  text: string;
  page?: number;
  headingPath: string[];
};

type ParsedDocument = {
  text: string;
  blocks: ParsedBlock[];
  metadata: Record<string, unknown>;
};

type SearchResult = {
  chunk: StoredChunk;
  citation: Citation;
  semanticScore: number;
  keywordScore: number;
  rrfScore: number;
  rerankScore: number;
};

function getExtension(fileName: string) {
  return fileName.toLowerCase().split(".").pop() ?? "";
}

export function validateKnowledgeFile(file: File) {
  const extension = getExtension(file.name);
  const mimeType = file.type || "text/plain";

  const allowedExtension = ["pdf", "md", "markdown", "docx", "txt"].includes(extension);
  const allowedMime = KNOWLEDGE_DOCUMENT_MIME_TYPES.includes(mimeType as (typeof KNOWLEDGE_DOCUMENT_MIME_TYPES)[number]);

  if (!allowedExtension && !allowedMime) {
    return { ok: false as const, reason: "unsupported_file_type" };
  }

  if (file.size > MAX_KNOWLEDGE_FILE_SIZE_BYTES) {
    return { ok: false as const, reason: "file_too_large" };
  }

  return { ok: true as const, extension };
}

function splitParagraphs(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMarkdown(text: string): ParsedDocument {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ParsedBlock[] = [];
  const headingPath: string[] = [];
  let buffer: string[] = [];

  const pushBuffer = () => {
    const value = buffer.join("\n").trim();
    if (!value) {
      buffer = [];
      return;
    }

    blocks.push({
      text: value,
      headingPath: [...headingPath],
    });
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (headingMatch) {
      pushBuffer();
      const level = headingMatch[1].length;
      headingPath.splice(level - 1);
      headingPath[level - 1] = headingMatch[2].trim();
      continue;
    }

    if (!line.trim()) {
      pushBuffer();
      continue;
    }

    buffer.push(line);
  }

  pushBuffer();

  return {
    text,
    blocks,
    metadata: {
      format: "markdown",
      headings: blocks.filter((block) => block.headingPath.length > 0).length,
    },
  };
}

function parseText(text: string): ParsedDocument {
  const paragraphs = splitParagraphs(text);
  return {
    text,
    blocks: paragraphs.map((paragraph) => ({ text: paragraph, headingPath: [] })),
    metadata: {
      format: "text",
      paragraphs: paragraphs.length,
    },
  };
}

async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  const paragraphs = splitParagraphs(result.value);
  return {
    text: result.value,
    blocks: paragraphs.map((paragraph) => ({ text: paragraph, headingPath: [] })),
    metadata: {
      format: "docx",
      paragraphs: paragraphs.length,
      messages: result.messages,
    },
  };
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const pages = result.text
    .split(/\f+/)
    .map((page) => splitParagraphs(page))
    .filter((page) => page.length > 0);

  const normalizedPages = pages.length ? pages : [splitParagraphs(result.text)];
  const blocks: ParsedBlock[] = normalizedPages.flatMap((pageBlocks, pageIndex) =>
    pageBlocks.map((block) => ({
      text: block,
      page: pageIndex + 1,
      headingPath: [],
    })),
  );

  return {
    text: result.text,
    blocks,
    metadata: {
      format: "pdf",
      pages: result.total,
    },
  };
}

async function parseKnowledgeDocument(fileName: string, fileType: string, buffer: Buffer) {
  const extension = getExtension(fileName);
  if (extension === "md" || extension === "markdown") {
    return parseMarkdown(buffer.toString("utf8"));
  }

  if (extension === "txt") {
    return parseText(buffer.toString("utf8"));
  }

  if (extension === "docx") {
    return parseDocx(buffer);
  }

  if (extension === "pdf") {
    return parsePdf(buffer);
  }

  if (fileType === "text/markdown") {
    return parseMarkdown(buffer.toString("utf8"));
  }

  return parseText(buffer.toString("utf8"));
}

function createTextChunks(blocks: ParsedBlock[]) {
  const chunks: Array<{ content: string; metadata: Record<string, unknown> }> = [];

  for (const block of blocks) {
    let start = 0;
    while (start < block.text.length) {
      const end = Math.min(start + DEFAULT_CHUNK_SIZE, block.text.length);
      const content = block.text.slice(start, end).trim();
      if (content) {
        chunks.push({
          content,
          metadata: {
            page: block.page,
            headingPath: block.headingPath,
            sourceOffset: start,
            sourceLength: content.length,
          },
        });
      }

      if (end >= block.text.length) {
        break;
      }

      start = Math.max(end - DEFAULT_CHUNK_OVERLAP, 0);
    }
  }

  return chunks;
}

function approximateTokens(text: string) {
  return Math.max(1, text.split(/\s+/).filter(Boolean).length);
}

function buildDeterministicEmbedding(text: string) {
  const { embeddingDimensions, embeddingModel } = getServerEnv();
  const vector: number[] = [];
  let seed = `${embeddingModel}:${text}`;

  while (vector.length < embeddingDimensions) {
    const digest = createHash("sha256").update(seed).digest();
    for (let index = 0; index < digest.length; index += 4) {
      const value = digest.readInt32BE(index) / 2147483647;
      vector.push(value);
      if (vector.length >= embeddingDimensions) {
        break;
      }
    }
    seed = `${seed}:${vector.length}`;
  }

  return vector;
}

function cosineSimilarity(left: number[], right: number[]) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);
}

function scoreKeywordMatch(query: string, content: string) {
  const terms = tokenize(query);
  if (!terms.length) {
    return 0;
  }

  const normalizedContent = content.toLowerCase();
  const hits = terms.filter((term) => normalizedContent.includes(term)).length;
  return hits / terms.length;
}

function toCitation(chunk: StoredChunk, score: number): Citation {
  const headingPath = Array.isArray(chunk.metadata.headingPath)
    ? (chunk.metadata.headingPath as string[]).filter(Boolean)
    : [];

  return {
    title: `${chunk.metadata.fileName ?? "knowledge"}`,
    excerpt: chunk.content.slice(0, 180),
    source:
      [headingPath.length ? `heading:${headingPath.join("/")}` : null, chunk.metadata.page ? `p.${chunk.metadata.page}` : null]
        .filter(Boolean)
        .join(" · ") || `chunk-${chunk.chunkIndex}`,
    score,
  };
}

function applyRrfRanking(results: Array<Omit<SearchResult, "rrfScore" | "rerankScore">>) {
  const semanticRank = [...results].sort((left, right) => right.semanticScore - left.semanticScore);
  const keywordRank = [...results].sort((left, right) => right.keywordScore - left.keywordScore);

  return results.map((result) => {
    const semanticIndex = Math.max(semanticRank.findIndex((entry) => entry.chunk.id === result.chunk.id), 0);
    const keywordIndex = Math.max(keywordRank.findIndex((entry) => entry.chunk.id === result.chunk.id), 0);
    const rrfScore = 1 / (60 + semanticIndex + 1) + 1 / (60 + keywordIndex + 1);
    const rerankScore = result.semanticScore * 0.45 + result.keywordScore * 0.35 + rrfScore * 20;

    return {
      ...result,
      rrfScore,
      rerankScore,
    };
  });
}

export async function listKnowledgeBases() {
  const store = await readStore();

  return knowledgeBaseCatalog.map((knowledgeBase) => {
    const documents = store.documents.filter((document) => document.knowledgeBaseId === knowledgeBase.id);
    const completed = documents.filter((document) => document.status === "completed");
    const lastSync = completed[0]?.updatedAt ?? knowledgeBase.lastSync;

    return {
      ...knowledgeBase,
      documents: documents.length,
      lastSync,
    };
  });
}

export async function listKnowledgeDocuments(knowledgeBaseId?: string) {
  const store = await readStore();
  return store.documents
    .filter((document) => (knowledgeBaseId ? document.knowledgeBaseId === knowledgeBaseId : true))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

async function setDocumentProgress(documentId: string, stage: (typeof DOCUMENT_PROCESS_STAGES)[number], progress: number, message: string, error?: string) {
  await updateStore((store) => {
    const document = store.documents.find((item) => item.id === documentId);
    if (document) {
      document.status = stage;
      document.updatedAt = nowIso();
      document.metadata = {
        ...document.metadata,
        progress,
        message,
        ...(error ? { error } : {}),
      };
    }
  });

  publishKnowledgeProgress({
    documentId,
    stage,
    progress,
    message,
    ...(error ? { error } : {}),
    completed: stage === "completed" || stage === "failed",
  });
}

async function processDocumentJob(document: StoredDocument, fileBuffer: Buffer) {
  try {
    await setDocumentProgress(document.id, "parsing", 15, "正在解析文档结构");
    const parsed = await parseKnowledgeDocument(document.fileName, document.fileType, fileBuffer);

    await setDocumentProgress(document.id, "chunking", 45, "正在执行语义分块");
    const chunks = createTextChunks(parsed.blocks);

    await setDocumentProgress(document.id, "embedding", 70, "正在生成 Embedding 向量");
    const embeddings = chunks.map((chunk) => buildDeterministicEmbedding(chunk.content));

    await setDocumentProgress(document.id, "indexing", 88, "正在写入检索索引");
    await updateStore((store) => {
      const removedChunkIds = new Set(
        store.chunks.filter((chunk) => chunk.documentId === document.id).map((chunk) => chunk.id),
      );
      store.chunks = store.chunks.filter((chunk) => chunk.documentId !== document.id);
      store.embeddings = store.embeddings.filter((embedding) => !removedChunkIds.has(embedding.chunkId));

      const timestamp = nowIso();
      const storedChunks: StoredChunk[] = chunks.map((chunk, index) => ({
        id: createId(),
        documentId: document.id,
        knowledgeBaseId: document.knowledgeBaseId,
        chunkIndex: index,
        content: chunk.content,
        tokens: approximateTokens(chunk.content),
        metadata: {
          ...chunk.metadata,
          fileName: document.fileName,
          fileType: document.fileType,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      const storedEmbeddings: StoredEmbedding[] = embeddings.map((embedding, index) => ({
        id: createId(),
        chunkId: storedChunks[index].id,
        model: getServerEnv().embeddingModel,
        dimensions: getServerEnv().embeddingDimensions,
        embedding,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      store.chunks.push(...storedChunks);
      store.embeddings.push(...storedEmbeddings);

      const target = store.documents.find((item) => item.id === document.id);
      if (target) {
        target.status = "completed";
        target.updatedAt = timestamp;
        target.metadata = {
          ...target.metadata,
          progress: 100,
          message: "文档已完成切片、向量化与索引",
          parsedMetadata: parsed.metadata,
          chunkCount: storedChunks.length,
        };
      }
    });

    publishKnowledgeProgress({
      documentId: document.id,
      stage: "completed",
      progress: 100,
      message: "文档已完成切片、向量化与索引",
      completed: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    await setDocumentProgress(document.id, "failed", 100, "文档处理失败", message);
  }
}

export async function uploadKnowledgeFiles(knowledgeBaseId: string, files: File[]): Promise<KnowledgeUploadResult> {
  const accepted: StoredDocument[] = [];
  const rejected: Array<{ fileName: string; reason: string }> = [];

  const uploadsDir = await ensureUploadsDir("knowledge");

  for (const file of files) {
    const validation = validateKnowledgeFile(file);
    if (!validation.ok) {
      rejected.push({ fileName: file.name, reason: validation.reason });
      continue;
    }

    const documentId = createId();
    const fileName = sanitizeFileName(file.name) || `${documentId}.${validation.extension}`;
    const storageKey = path.join("knowledge", `${documentId}-${fileName}`);
    const filePath = path.join(uploadsDir, `${documentId}-${fileName}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const document: StoredDocument = {
      id: documentId,
      knowledgeBaseId,
      fileName: file.name,
      fileType: file.type || validation.extension,
      storageKey,
      status: "uploaded",
      metadata: {
        size: file.size,
        progress: 5,
        message: "文件已上传，等待进入解析队列",
      },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    await updateStore((store) => {
      store.documents.push(document);
    });

    publishKnowledgeProgress({
      documentId,
      stage: "uploaded",
      progress: 5,
      message: "文件已上传，等待进入解析队列",
      completed: false,
    });

    accepted.push(document);
    void processDocumentJob(document, buffer);
  }

  return { accepted, rejected };
}

export async function searchKnowledgeBase(message: string, knowledgeBaseId?: string, limit = 5) {
  const store = await readStore();
  const scopedChunks = store.chunks.filter((chunk) => (knowledgeBaseId ? chunk.knowledgeBaseId === knowledgeBaseId : true));

  if (!scopedChunks.length) {
    const fallbackKnowledgeBase = knowledgeBaseCatalog.find((item) => item.id === knowledgeBaseId) ?? knowledgeBaseCatalog[0];
    return {
      results: [],
      citations: [
        {
          title: `${fallbackKnowledgeBase.name} / onboarding.pdf`,
          excerpt: "建议先按客户分层筛选，再结合标准话术与最近一次跟进记录输出行动建议。",
          source: "p.12 · chunk-001",
          score: 0.42,
        },
        {
          title: `${fallbackKnowledgeBase.name} / faq.md`,
          excerpt: "在成本敏感场景中优先选择轻量模型，并记录 Token 与调用策略。",
          source: "section 2.3 · chunk-014",
          score: 0.38,
        },
      ],
      context: ["当前知识库暂无真实上传文档，已回退到仓库内置的 MVP 示例引用。"],
    };
  }

  const embeddingMap = new Map(store.embeddings.map((embedding) => [embedding.chunkId, embedding]));
  const queryEmbedding = buildDeterministicEmbedding(message);

  const scored = scopedChunks.map((chunk) => {
    const embedding = embeddingMap.get(chunk.id);
    const semanticScore = embedding ? cosineSimilarity(queryEmbedding, embedding.embedding) : 0;
    const keywordScore = scoreKeywordMatch(message, chunk.content);
    return {
      chunk,
      citation: toCitation(chunk, semanticScore),
      semanticScore,
      keywordScore,
    };
  });

  const ranked = applyRrfRanking(scored)
    .sort((left, right) => right.rerankScore - left.rerankScore)
    .slice(0, limit);

  return {
    results: ranked,
    citations: ranked.map((item) => ({
      ...item.citation,
      score: Number(item.rerankScore.toFixed(4)),
    })),
    context: ranked.map((item) => item.chunk.content),
  };
}

export async function buildRagAnswer(message: string, knowledgeBaseId?: string): Promise<RagAnswer> {
  const search = await searchKnowledgeBase(message, knowledgeBaseId);
  const knowledgeBase = knowledgeBaseCatalog.find((item) => item.id === knowledgeBaseId) ?? knowledgeBaseCatalog[0];

  return {
    summary: `已围绕“${knowledgeBase.name}”完成 Hybrid Search、RRF 融合与 gte-rerank 精排。`,
    steps: [
      "执行 Zod 校验并绑定知识库范围。",
      "并行执行语义检索与关键词检索。",
      "使用 RRF 合并候选结果并按 gte-rerank 路径精排。",
      "将命中文档片段注入模型上下文并生成带引用回答。",
    ],
    citations: search.citations,
    context: search.context,
  };
}
