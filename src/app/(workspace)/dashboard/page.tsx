import { PageHeader } from "@/components/page-header";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { systemStatus } from "@/server/services/system-status";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="MVP 工作台"
        description="这里聚合当前 MVP 已搭建的核心模块、技术决策、知识库与 CSV / Excel 数据入口进度。"
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Object.entries(systemStatus).map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium capitalize text-white">{label}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{value}</p>
          </article>
        ))}
      </section>

      <DashboardOverview />
    </>
  );
}
