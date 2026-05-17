"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginFormSchema } from "@/server/validation/schemas";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "请输入有效账号信息");
      return;
    }

    setIsPending(true);
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    setIsPending(false);

    if (result?.error) {
      setErrorMessage("登录失败，请检查邮箱和密码后重试。");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">NextAuth</p>
        <h1 className="text-3xl font-semibold text-white">登录与会话管理</h1>
        <p className="text-sm leading-7 text-zinc-400">
          当前仓库已切换为 NextAuth Credentials 登录，工作台页面与 API 均要求真实会话。
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white">首批目标</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• NextAuth Credentials</li>
            <li>• admin / member 最小角色模型</li>
            <li>• 工作台与 API 鉴权保护</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white">默认开发账号</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• admin@example.com / ChangeMe123!</li>
            <li>• member@example.com / ChangeMe123!</li>
            <li>• 可通过 .env.local 覆盖</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block space-y-2 text-sm text-zinc-300">
          <span>邮箱</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm text-zinc-300">
          <span>密码</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />
        </label>

        {errorMessage ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "登录中..." : "登录进入工作台"}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            返回首页
          </Link>
        </div>
      </form>
    </div>
  );
}
