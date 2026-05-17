"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { KNOWLEDGE_UPLOAD_ACCEPT } from "@/server/config/mvp";

type KnowledgeBaseItem = {
  id: string;
  name: string;
  focus: string;
  documents: number;
  lastSync: string;
  supportedFiles: string;
  retrievalMode: string;
  readiness: "ready" | "planned" | "scaffolded";
};

type KnowledgeDocument = {
  id: string;
  knowledgeBaseId: string;
  fileName: string;
  fileType: string;
  status: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
};

const pipeline = [
  "文件上传与状态登记",
  "文档解析与结构抽取",
  "语义分块与元数据补齐",
  "Embedding 向量化",
  "Hybrid Search + RRF + gte-rerank",
];

export function KnowledgeOverview() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseItem[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState("sales-playbook");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, { stage: string; progress: number; message: string }>>({});

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/knowledge?knowledgeBaseId=${selectedKnowledgeBase}`, { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { knowledgeBases: KnowledgeBaseItem[]; documents: KnowledgeDocument[] };
    startTransition(() => {
      setKnowledgeBases(payload.knowledgeBases);
      setDocuments(payload.documents);
    });
  }, [selectedKnowledgeBase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedBase = useMemo(
    () => knowledgeBases.find((knowledgeBase) => knowledgeBase.id === selectedKnowledgeBase),
    [knowledgeBases, selectedKnowledgeBase],
  );

  function subscribeProgress(documentId: string) {
    const eventSource = new EventSource(`/api/knowledge/events/${documentId}`);
    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        documentId: string;
        stage: string;
        progress: number;
        message: string;
        completed: boolean;
      };
      setProgressMap((current) => ({
        ...current,
        [payload.documentId]: {
          stage: payload.stage,
          progress: payload.progress,
          message: payload.message,
        },
      }));

      if (payload.completed) {
        eventSource.close();
        void loadData();
      }
    };
    eventSource.onerror = () => {
      eventSource.close();
    };
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFiles.length) {
      setMessage("请选择至少一个知识库文件。");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("knowledgeBaseId", selectedKnowledgeBase);
    selectedFiles.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/knowledge", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      accepted?: Array<{ id: string; fileName: string }>;
      rejected?: Array<{ fileName: string; reason: string }>;
      error?: unknown;
    };

    if (!response.ok) {
      setMessage(typeof payload.error === "string" ? payload.error : "上传失败，请检查文件类型。");
      setIsUploading(false);
      return;
    }

    payload.accepted?.forEach((document) => subscribeProgress(document.id));
    if (payload.rejected?.length) {
      setMessage(`部分文件被拒绝：${payload.rejected.map((item) => `${item.fileName}(${item.reason})`).join("、")}`);
    } else {
      setMessage("文件已进入处理队列，可在下方查看解析进度。");
    }
    setSelectedFiles([]);
    setIsUploading(false);
    void loadData();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">知识库清单</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              首期仅支持 {KNOWLEDGE_UPLOAD_ACCEPT}，并通过 SSE 回传分阶段处理进度。
            </p>
          </div>
        </div>

        <label className="block space-y-2 text-sm text-zinc-300">
          <span>当前知识库</span>
          <select
            value={selectedKnowledgeBase}
            onChange={(event) => setSelectedKnowledgeBase(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            {knowledgeBases.map((knowledgeBase) => (
              <option key={knowledgeBase.id} value={knowledgeBase.id}>
                {knowledgeBase.name}
              </option>
            ))}
          </select>
        </label>

        {selectedBase ? (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-white">{selectedBase.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{selectedBase.focus}</p>
              </div>
              <StatusPill tone={selectedBase.readiness}>{selectedBase.readiness}</StatusPill>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              <span>文档数：{selectedBase.documents}</span>
              <span>最后同步：{selectedBase.lastSync}</span>
              <span>格式白名单：{selectedBase.supportedFiles}</span>
              <span>检索策略：{selectedBase.retrievalMode}</span>
            </div>
          </article>
        ) : null}

        <form onSubmit={handleUpload} className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
          <div>
            <h3 className="font-medium text-white">上传并入库</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              文件会依次经过解析、分块、Embedding、索引，完成后即可被聊天中心检索。
            </p>
          </div>
          <input
            type="file"
            accept={KNOWLEDGE_UPLOAD_ACCEPT}
            multiple
            onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
            className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-zinc-400"
          />
          {selectedFiles.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
              {selectedFiles.map((file) => (
                <p key={file.name}>{file.name}</p>
              ))}
            </div>
          ) : null}
          {message ? <p className="text-sm text-sky-200">{message}</p> : null}
          <button
            type="submit"
            disabled={isUploading}
            className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "上传中..." : "开始处理"}
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="font-medium text-white">文档处理状态</h3>
          {documents.length ? (
            documents.map((document) => {
              const progress = progressMap[document.id];
              const progressValue = progress?.progress ?? Number(document.metadata.progress ?? 0);
              const progressMessage = progress?.message ?? String(document.metadata.message ?? "等待处理");

              return (
                <article key={document.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-white">{document.fileName}</h4>
                      <p className="mt-2 text-sm text-zinc-400">{document.fileType}</p>
                    </div>
                    <StatusPill tone={document.status === "completed" ? "ready" : document.status === "failed" ? "planned" : "scaffolded"}>
                      {document.status}
                    </StatusPill>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-sky-400 transition-all" style={{ width: `${progressValue}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">{progressMessage}</p>
                </article>
              );
            })
          ) : (
            <p className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">当前知识库还没有已上传文档。</p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">RAG Pipeline</h2>
          <ol className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
            {pipeline.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/15 text-xs font-semibold text-sky-300">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">MVP 范围边界</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• 首期只接受 PDF / Markdown / DOCX / TXT。</li>
            <li>• 检索采用语义检索 + 关键词检索 + RRF + gte-rerank。</li>
            <li>• SSE 回传解析、切片、Embedding、索引进度。</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
