import { PageHeader } from "@/components/page-header";
import { getProviderSummary } from "@/server/ai/provider-registry";
import { getServerEnv } from "@/server/config/env";

const sections = [
  {
    title: "环境变量",
    items: [
      "AUTH_SECRET / NEXTAUTH_URL",
      "DEEPSEEK_API_KEY / QWEN_API_KEY",
      "EMBEDDING_MODEL / RERANK_MODEL",
      "STORAGE_DRIVER / UPLOADS_DIR / DATABASE_URL",
    ],
  },
  {
    title: "系统边界",
    items: ["单体 Next.js 16", "NextAuth + Zod", "PostgreSQL + pgvector", "本地文件存储 / S3 抽象"],
  },
  {
    title: "延后到下一阶段",
    items: ["多租户", "复杂 RBAC", "计费", "复杂 DAG", "企业审计"],
  },
];

export default function SettingsPage() {
  const env = getServerEnv();
  const providers = getProviderSummary();

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="系统设置与配置"
        description="将认证、模型、Embedding、Rerank、文件存储和部署约束统一收敛到一个页面。"
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
                {section.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="space-y-6">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">运行时配置</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                <p className="text-zinc-500">APP URL</p>
                <p className="mt-2 break-all">{env.appUrl}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                <p className="text-zinc-500">Storage Driver</p>
                <p className="mt-2">{env.storageDriver}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                <p className="text-zinc-500">Embedding / Rerank</p>
                <p className="mt-2">{env.embeddingModel} / {env.rerankModel}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                <p className="text-zinc-500">Session Strategy</p>
                <p className="mt-2">NextAuth Credentials + JWT</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300 sm:col-span-2">
                <p className="text-zinc-500">DATABASE_URL</p>
                <p className="mt-2 break-all">{env.databaseUrl}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">模型 Provider 摘要</h2>
            <div className="mt-5 space-y-3">
              {providers.map((provider) => (
                <div key={provider.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-white">{provider.provider}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {provider.configured ? "configured" : "fallback"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{provider.focus}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
