import Link from "next/link";
import { foundationTracks } from "@/lib/catalog";
import { StatCard } from "@/components/stat-card";
import { appManifest } from "@/server/services/app-manifest";
import { mvpDecisions } from "@/server/services/system-status";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#09090b_100%)] px-4 py-6 text-white lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <section className="rounded-[36px] border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur lg:p-12">
          <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">Enterprise AI OS MVP</p>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white lg:text-6xl">
                  多模态 AI 智能看板与知识库 Agent 平台
                </h1>
                <p className="max-w-3xl text-base leading-8 text-zinc-300 lg:text-lg">
                  当前版本已将 PRD 收敛为可落地的 MVP 骨架：单体 Next.js 16、Drizzle +
                  PostgreSQL/pgvector、AI 聊天、知识库、Agent、Workflow 与 Dashboard 基础工作区。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  打开工作台
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  查看登录页
                </Link>
                <Link
                  href="/api/health"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  健康检查 API
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {appManifest.stats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-white">MVP 实施轨道</h2>
            <div className="mt-6 space-y-4">
              {foundationTracks.map((track) => (
                <article key={track.title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <h3 className="font-medium text-white">{track.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{track.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-white">已固化决策</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-zinc-400">
              {mvpDecisions.map((decision) => (
                <li key={decision} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  {decision}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
