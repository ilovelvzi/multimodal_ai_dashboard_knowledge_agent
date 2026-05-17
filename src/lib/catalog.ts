import type { Route } from "next";
import { DASHBOARD_UPLOAD_ACCEPT, KNOWLEDGE_UPLOAD_ACCEPT } from "@/server/config/mvp";

export type Readiness = "ready" | "planned" | "scaffolded";

export type NavigationItem = {
  href: Route;
  label: string;
  description: string;
};

export type ModelSummary = {
  id: string;
  label: string;
  provider: string;
  focus: string;
  readiness: Readiness;
};

export type KnowledgeBaseSummary = {
  id: string;
  name: string;
  focus: string;
  documents: number;
  lastSync: string;
  supportedFiles: string;
  retrievalMode: string;
  readiness: Readiness;
};

export type AgentSummary = {
  id: string;
  name: string;
  objective: string;
  tools: string[];
  readiness: Readiness;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  steps: number;
  outcome: string;
  readiness: Readiness;
};

export type DashboardDataset = {
  id: string;
  name: string;
  source: string;
  lastUpdated: string;
  supportedFiles: string;
  readiness: Readiness;
};

export const workspaceNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "工作台", description: "MVP 总览、上传入口与关键指标" },
  { href: "/chat", label: "AI 聊天", description: "DeepSeek / Qwen、RAG 上下文、引用式问答" },
  { href: "/knowledge", label: "知识库", description: "PDF / Markdown / DOCX / TXT 上传、切片、检索" },
  { href: "/agents", label: "Agent", description: "Prompt、Tools、Memory 的最小闭环" },
  { href: "/workflow", label: "工作流", description: "极简节点编排与执行记录" },
  { href: "/settings", label: "系统设置", description: "认证、模型、Embedding、Rerank 与存储配置" },
];

export const modelCatalog: ModelSummary[] = [
  {
    id: "deepseek:chat",
    label: "DeepSeek Chat",
    provider: "DeepSeek",
    focus: "通用问答 / 成本敏感场景 / 流式输出",
    readiness: "ready",
  },
  {
    id: "qwen:plus",
    label: "Qwen Plus",
    provider: "Qwen",
    focus: "中文场景 / 知识问答 / 多轮总结",
    readiness: "ready",
  },
];

export const knowledgeBaseCatalog: KnowledgeBaseSummary[] = [
  {
    id: "sales-playbook",
    name: "销售作战手册",
    focus: "销售 SOP、报价策略、FAQ",
    documents: 0,
    lastSync: "待接入真实文档",
    supportedFiles: KNOWLEDGE_UPLOAD_ACCEPT,
    retrievalMode: "Hybrid Search + RRF + gte-rerank",
    readiness: "ready",
  },
  {
    id: "product-docs",
    name: "产品说明与版本记录",
    focus: "PRD、发布说明、迭代日志",
    documents: 0,
    lastSync: "待接入真实文档",
    supportedFiles: KNOWLEDGE_UPLOAD_ACCEPT,
    retrievalMode: "Hybrid Search + RRF + gte-rerank",
    readiness: "ready",
  },
];

export const agentCatalog: AgentSummary[] = [
  {
    id: "data-analyst",
    name: "数据分析 Agent",
    objective: "基于上传数据集生成图表和业务洞察",
    tools: ["knowledge-search", "dataset-summary", "chart-plan"],
    readiness: "scaffolded",
  },
  {
    id: "sales-assistant",
    name: "销售助手 Agent",
    objective: "读取销售知识库并输出行动建议",
    tools: ["knowledge-search", "http-request"],
    readiness: "ready",
  },
];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "lead-qualification",
    name: "线索判定",
    steps: 4,
    outcome: "输入客户信息后输出优先级与跟进建议",
    readiness: "ready",
  },
  {
    id: "document-review",
    name: "文档审阅",
    steps: 5,
    outcome: "总结上传资料并返回风险提示",
    readiness: "scaffolded",
  },
];

export const dashboardDatasets: DashboardDataset[] = [
  {
    id: "north-region-sales",
    name: "北区销售数据",
    source: "CSV Upload",
    lastUpdated: "待上传真实数据",
    supportedFiles: DASHBOARD_UPLOAD_ACCEPT,
    readiness: "ready",
  },
  {
    id: "campaign-performance",
    name: "市场活动效果",
    source: "Excel Upload",
    lastUpdated: "待上传真实数据",
    supportedFiles: DASHBOARD_UPLOAD_ACCEPT,
    readiness: "ready",
  },
];

export const foundationTracks = [
  {
    title: "平台底座",
    description: "Next.js 16 单体、TypeScript、Tailwind、App Router、认证与路由保护。",
  },
  {
    title: "数据与认证",
    description: "NextAuth Credentials、Zod 输入校验、Drizzle schema 与本地 MVP 数据存储。",
  },
  {
    title: "AI 能力层",
    description: "DeepSeek / Qwen 模型路由、Embedding、Rerank、RAG 检索与流式回答。",
  },
  {
    title: "业务模块",
    description: "聊天、知识库、Dashboard 的真实上传/问答闭环，Agent/Workflow 继续复用底层能力。",
  },
] as const;
