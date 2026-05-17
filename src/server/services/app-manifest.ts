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
    { label: "候选模型", value: modelCatalog.length, helper: "统一模型目录与路由占位" },
    { label: "知识库样例", value: knowledgeBaseCatalog.length, helper: "围绕 PDF / RAG MVP" },
    { label: "Agent 模板", value: agentCatalog.length, helper: "Prompt + Tool + Memory" },
    { label: "工作流模板", value: workflowTemplates.length, helper: "极简节点编排" },
    { label: "看板数据集", value: dashboardDatasets.length, helper: "CSV / Excel 首批范围" },
  ],
} as const;
