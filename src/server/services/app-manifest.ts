import {
  agentCatalog,
  dashboardDatasets,
  foundationTracks,
  knowledgeBaseCatalog,
  modelCatalog,
  workflowTemplates,
  workspaceNavigation,
} from "@/lib/catalog";

export const appManifest = {
  name: "Multimodal AI Dashboard Knowledge Agent",
  description: "Next.js 16 MVP foundation for an AI-native enterprise workspace.",
  navigation: workspaceNavigation,
  foundationTracks,
  stats: [
    { label: "模型主路径", value: modelCatalog.length, helper: "DeepSeek / Qwen" },
    { label: "知识库", value: knowledgeBaseCatalog.length, helper: "PDF / Markdown / DOCX / TXT" },
    { label: "Agent 模板", value: agentCatalog.length, helper: "Prompt + Tool + Memory" },
    { label: "工作流模板", value: workflowTemplates.length, helper: "极简节点编排" },
    { label: "看板数据集", value: dashboardDatasets.length, helper: "CSV / Excel 首批范围" },
  ],
} as const;
