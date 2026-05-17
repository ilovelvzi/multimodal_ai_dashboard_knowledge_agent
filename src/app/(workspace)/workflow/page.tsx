import { PageHeader } from "@/components/page-header";
import { WorkflowOverview } from "@/features/workflow/components/workflow-overview";

export default function WorkflowPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workflow"
        title="极简工作流"
        description="先支持 Start、Prompt、Condition、Tool、Output 五类节点，确保工作流具备演示与扩展价值。"
      />
      <WorkflowOverview />
    </>
  );
}
