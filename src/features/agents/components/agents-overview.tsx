import { agentCatalog } from "@/lib/catalog";
import { StatusPill } from "@/components/status-pill";
import { toolRegistry } from "@/server/tools/registry";

export function AgentsOverview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Agent 目录</h2>
        <div className="mt-6 space-y-4">
          {agentCatalog.map((agent) => (
            <article key={agent.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-medium text-white">{agent.name}</h3>
                <StatusPill tone={agent.readiness}>{agent.readiness}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{agent.objective}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {agent.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Tool Registry</h2>
          <div className="mt-5 space-y-3">
            {toolRegistry.map((tool) => (
              <div key={tool.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{tool.label}</p>
                  <StatusPill tone={tool.readiness}>{tool.readiness}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">执行闭环</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• Prompt Template 外置配置</li>
            <li>• Conversation Memory 占位</li>
            <li>• Tool Calling / Function Calling 入口</li>
            <li>• Agent Run 持久化模型</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
