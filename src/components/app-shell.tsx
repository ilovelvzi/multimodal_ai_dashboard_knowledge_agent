import Link from "next/link";
import { workspaceNavigation } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { DemoSession } from "@/server/auth/session";

type AppShellProps = {
  children: React.ReactNode;
  session: DemoSession;
};

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(180deg,_#09090b_0%,_#111827_100%)] text-zinc-100">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">AI OS MVP</p>
              <h1 className="mt-3 text-xl font-semibold text-white">
                多模态 AI 看板与知识库 Agent 平台
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                聚焦聊天、知识库、Agent、Workflow 与 Dashboard 的单体式 MVP。
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{session.user.email}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                {session.user.role}
              </p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {workspaceNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl border border-transparent px-4 py-3 transition",
                  "hover:border-white/10 hover:bg-white/5",
                )}
              >
                <p className="font-medium text-white">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{item.description}</p>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="rounded-[32px] border border-white/10 bg-black/20 p-6 backdrop-blur lg:p-8">
          <div className="flex flex-col gap-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
