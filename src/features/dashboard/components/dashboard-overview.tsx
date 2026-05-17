"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { DASHBOARD_UPLOAD_ACCEPT } from "@/server/config/mvp";

type SeedDataset = {
  id: string;
  name: string;
  source: string;
  lastUpdated: string;
  supportedFiles: string;
  readiness: "ready" | "planned" | "scaffolded";
};

type UploadedDataset = {
  id: string;
  name: string;
  sourceType: string;
  fileName: string;
  schemaSnapshot: { rowCount?: number; columns?: Array<{ name: string; type: string; nonNullCount: number }> };
  previewRows: Array<Record<string, string | number | null>>;
  reportMarkdown: string;
};

export function DashboardOverview() {
  const [seeds, setSeeds] = useState<SeedDataset[]>([]);
  const [uploaded, setUploaded] = useState<UploadedDataset[]>([]);
  const [name, setName] = useState("销售数据样例");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadDatasets = useCallback(async () => {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { seeds: SeedDataset[]; uploaded: UploadedDataset[] };
    startTransition(() => {
      setSeeds(payload.seeds);
      setUploaded(payload.uploaded);
    });
  }, []);

  useEffect(() => {
    void loadDatasets();
  }, [loadDatasets]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage("请选择 CSV 或 Excel 文件。");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("file", file);

    const response = await fetch("/api/dashboard", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(typeof payload.error === "string" ? payload.error : "数据集上传失败");
      setIsUploading(false);
      return;
    }

    setMessage("数据集已完成解析并生成字段概览与 Markdown 报告。");
    setFile(null);
    setIsUploading(false);
    void loadDatasets();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-white">数据集与图表</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">首期仅支持 {DASHBOARD_UPLOAD_ACCEPT} 上传，并自动生成字段概览与 Markdown 报告。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
          <label className="block space-y-2 text-sm text-zinc-300">
            <span>数据集名称</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>
          <input
            type="file"
            accept={DASHBOARD_UPLOAD_ACCEPT}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-zinc-400"
          />
          {message ? <p className="text-sm text-sky-200">{message}</p> : null}
          <button
            type="submit"
            disabled={isUploading}
            className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "处理中..." : "上传并分析"}
          </button>
        </form>

        <div className="space-y-4">
          {uploaded.map((dataset) => (
            <article key={dataset.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium text-white">{dataset.name}</h3>
                <StatusPill tone="ready">uploaded</StatusPill>
              </div>
              <div className="mt-3 flex flex-wrap gap-6 text-sm text-zinc-400">
                <span>来源：{dataset.sourceType}</span>
                <span>文件：{dataset.fileName}</span>
                <span>预览行数：{dataset.schemaSnapshot.rowCount ?? 0}</span>
              </div>
              <div className="mt-5 overflow-x-auto rounded-3xl border border-white/10 bg-black/10 p-4">
                <table className="min-w-full text-left text-sm text-zinc-300">
                  <thead>
                    <tr>
                      {(dataset.schemaSnapshot.columns ?? []).map((column) => (
                        <th key={column.name} className="px-3 py-2 font-medium text-white">{column.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.previewRows.slice(0, 4).map((row, rowIndex) => (
                      <tr key={`${dataset.id}-${rowIndex}`}>
                        {Object.keys(row).map((column) => (
                          <td key={`${dataset.id}-${rowIndex}-${column}`} className="px-3 py-2 text-zinc-400">
                            {String(row[column] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-black/10 p-4 text-xs leading-6 text-zinc-400">
                {dataset.reportMarkdown}
              </pre>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">数据入口边界</h2>
          <div className="mt-6 space-y-4">
            {seeds.map((dataset) => (
              <article key={dataset.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-medium text-white">{dataset.name}</h3>
                  <StatusPill tone={dataset.readiness}>{dataset.readiness}</StatusPill>
                </div>
                <div className="mt-3 flex flex-wrap gap-6 text-sm text-zinc-400">
                  <span>来源：{dataset.source}</span>
                  <span>更新时间：{dataset.lastUpdated}</span>
                </div>
                <p className="mt-4 text-sm text-zinc-400">支持格式：{dataset.supportedFiles}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">MVP 数据范围</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• CSV / Excel 上传作为首批唯一数据入口。</li>
            <li>• 系统会自动生成字段概览、预览和 Markdown 报告。</li>
            <li>• 外部数据库连接与高级权限管理延后到下一阶段。</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
