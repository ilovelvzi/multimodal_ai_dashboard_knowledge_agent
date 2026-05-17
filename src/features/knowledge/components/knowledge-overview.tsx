import { knowledgeBaseCatalog } from "@/lib/catalog";
import { StatusPill } from "@/components/status-pill";

const pipeline = [
  "文件上传与状态登记",
  "文档解析与结构抽取",
  "文本切片与元数据补齐",
  "Embedding 向量化",
  "pgvector 检索与引用拼接",
];

export function KnowledgeOverview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">知识库清单</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              当前先聚焦 PDF / 文档型资料，后续再扩展 DOCX、XLSX 和外部同步源。
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {knowledgeBaseCatalog.map((knowledgeBase) => (
            <article
              key={knowledgeBase.id}
              className="rounded-3xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">{knowledgeBase.name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{knowledgeBase.focus}</p>
                </div>
                <StatusPill tone={knowledgeBase.readiness}>{knowledgeBase.readiness}</StatusPill>
              </div>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-zinc-400">
                <span>{knowledgeBase.documents} 份文档</span>
                <span>最后同步：{knowledgeBase.lastSync}</span>
              </div>
            </article>
          ))}
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
            <li>• 首期仅保证 PDF / Markdown 文档处理路径。</li>
            <li>• 检索策略以 Dense + 引用回答为主，Hybrid Search 延后。</li>
            <li>• 向量存储统一落到 PostgreSQL + pgvector。</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
