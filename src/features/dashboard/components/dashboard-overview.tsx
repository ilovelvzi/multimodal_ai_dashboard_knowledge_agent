import { dashboardDatasets } from "@/lib/catalog";
import { StatusPill } from "@/components/status-pill";

export function DashboardOverview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">数据集与图表</h2>
        <div className="mt-6 space-y-4">
          {dashboardDatasets.map((dataset) => (
            <article key={dataset.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium text-white">{dataset.name}</h3>
                <StatusPill tone={dataset.readiness}>{dataset.readiness}</StatusPill>
              </div>
              <div className="mt-3 flex flex-wrap gap-6 text-sm text-zinc-400">
                <span>来源：{dataset.source}</span>
                <span>更新时间：{dataset.lastUpdated}</span>
              </div>
              <div className="mt-5 grid h-40 grid-cols-6 items-end gap-3 rounded-3xl border border-white/10 bg-gradient-to-b from-sky-400/10 to-transparent p-4">
                {[44, 72, 58, 88, 64, 94].map((height, index) => (
                  <div
                    key={`${dataset.id}-${height}`}
                    className="rounded-t-2xl bg-gradient-to-t from-sky-400 to-cyan-200"
                    style={{ height: `${height}%`, opacity: 0.72 + index * 0.04 }}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">AI Insight</h2>
          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-zinc-300">
            <p>
              北区销售数据在最近 7 天保持稳定增长，线索转化主要来自高意向客户池。建议将
              知识库中的标准跟进话术与当前高转化字段结合，生成下一轮销售行动清单。
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">MVP 数据范围</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
            <li>• CSV / Excel 上传作为首批数据入口</li>
            <li>• 表格预览、基础图表和 Markdown 报告先行</li>
            <li>• 外部数据库连接与权限管理延后到下一阶段</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
