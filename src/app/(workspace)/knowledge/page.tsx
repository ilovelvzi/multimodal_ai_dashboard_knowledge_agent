import { PageHeader } from "@/components/page-header";
import { KnowledgeOverview } from "@/features/knowledge/components/knowledge-overview";

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        title="知识库系统"
        description="围绕 PDF / Markdown / DOCX / TXT，先落地文件上传、文档处理、切片、向量化、Hybrid Search 与引用式回答闭环。"
      />
      <KnowledgeOverview />
    </>
  );
}
