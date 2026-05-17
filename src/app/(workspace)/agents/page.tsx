import { PageHeader } from "@/components/page-header";
import { AgentsOverview } from "@/features/agents/components/agents-overview";

export default function AgentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Agent System"
        title="Agent 管理"
        description="MVP 只实现 Prompt + Tools + Memory + Loop 的最小自主闭环，不引入复杂多 Agent 编排。"
      />
      <AgentsOverview />
    </>
  );
}
