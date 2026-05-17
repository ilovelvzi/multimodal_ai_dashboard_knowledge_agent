import { PageHeader } from "@/components/page-header";
import { KnowledgeOverview } from "@/features/knowledge/components/knowledge-overview";

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        title="知识库系统"
        description="围绕 PDF / 文档型资料，先落地文件上传、文档处理、切片、向量化、检索与引用式回答的完整闭环。"
      />
      <KnowledgeOverview />
    </>
  );
}
