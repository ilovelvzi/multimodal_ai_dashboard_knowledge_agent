import { workflowTemplates } from "@/lib/catalog";
import { StatusPill } from "@/components/status-pill";

const nodeTypes = ["Start", "Prompt / LLM", "Condition", "Tool", "Output"];

export function WorkflowOverview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Workflow 模板</h2>
        <div className="mt-6 space-y-4">
          {workflowTemplates.map((workflow) => (
            <article key={workflow.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium text-white">{workflow.name}</h3>
                <StatusPill tone={workflow.readiness}>{workflow.readiness}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{workflow.outcome}</p>
              <p className="mt-4 text-sm text-zinc-500">{workflow.steps} 个节点</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">MVP 节点能力</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {nodeTypes.map((node) => (
              <span
                key={node}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200"
              >
                {node}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">暂不纳入范围</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• 复杂 DAG 执行引擎</li>
            <li>• 分布式任务与 Cron 调度</li>
            <li>• Human in the Loop 与状态恢复编排</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
