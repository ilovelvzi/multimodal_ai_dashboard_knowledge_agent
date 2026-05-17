import Link from "next/link";

export function LoginForm() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Auth Foundation</p>
        <h1 className="text-3xl font-semibold text-white">登录与会话抽象</h1>
        <p className="text-sm leading-7 text-zinc-400">
          当前仓库先落地登录页、角色边界和服务抽象，后续可无缝接入 Better Auth / NextAuth。
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white">首批目标</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• 基础登录页与会话占位</li>
            <li>• admin / member 最小角色模型</li>
            <li>• API 级鉴权边界预留</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white">当前状态</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• 演示会话已预置</li>
            <li>• 生产鉴权待接入</li>
            <li>• 环境变量模板已准备</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
        >
          进入工作台
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
