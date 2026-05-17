export type Readiness = "ready" | "planned" | "scaffolded";

export type NavigationItem = {
  href: string;
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
  readiness: Readiness;
};

export const workspaceNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "工作台", description: "MVP 总览与关键指标" },
  { href: "/chat", label: "AI 聊天", description: "流式问答、模型切换、知识库上下文" },
  { href: "/knowledge", label: "知识库", description: "文档处理、切片、向量化与检索" },
  { href: "/agents", label: "Agent", description: "Prompt、Tools、Memory 的最小闭环" },
  { href: "/workflow", label: "工作流", description: "极简节点编排与执行记录" },
  { href: "/settings", label: "系统设置", description: "模型、数据库、存储与环境配置" },
];

export const modelCatalog: ModelSummary[] = [
  {
    id: "openai:gpt-4.1-mini",
    label: "GPT-4.1 mini",
    provider: "OpenAI",
    focus: "通用问答 / Tool Calling",
    readiness: "ready",
  },
  {
    id: "anthropic:claude-3-7-sonnet",
    label: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    focus: "长文本推理 / 复杂总结",
    readiness: "scaffolded",
  },
  {
    id: "deepseek:chat",
    label: "DeepSeek Chat",
    provider: "DeepSeek",
    focus: "成本敏感场景",
    readiness: "planned",
  },
];

export const knowledgeBaseCatalog: KnowledgeBaseSummary[] = [
  {
    id: "sales-playbook",
    name: "销售作战手册",
    focus: "销售 SOP、报价策略、FAQ",
    documents: 42,
    lastSync: "2 小时前",
    readiness: "scaffolded",
  },
  {
    id: "product-docs",
    name: "产品说明与版本记录",
    focus: "PRD、发布说明、迭代日志",
    documents: 18,
    lastSync: "今天",
    readiness: "ready",
  },
  {
    id: "support-center",
    name: "客服知识中心",
    focus: "工单策略、常见问题、话术模板",
    documents: 27,
    lastSync: "昨天",
    readiness: "planned",
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
  {
    id: "ops-coordinator",
    name: "运营协同 Agent",
    objective: "串联提示词节点与外部工具执行运营任务",
    tools: ["workflow-runner", "file-reader"],
    readiness: "planned",
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
    outcome: "总结上传 PDF 并返回风险提示",
    readiness: "scaffolded",
  },
  {
    id: "weekly-report",
    name: "周报生成",
    steps: 3,
    outcome: "整合数据与知识库生成 Markdown 报告",
    readiness: "planned",
  },
];

export const dashboardDatasets: DashboardDataset[] = [
  {
    id: "north-region-sales",
    name: "北区销售数据",
    source: "CSV Upload",
    lastUpdated: "今天 09:15",
    readiness: "ready",
  },
  {
    id: "campaign-performance",
    name: "市场活动效果",
    source: "Excel Upload",
    lastUpdated: "昨天 18:20",
    readiness: "scaffolded",
  },
];

export const foundationTracks = [
  {
    title: "平台底座",
    description: "Next.js 16 单体、TypeScript、Tailwind、App Router、基础导航与页面框架。",
  },
  {
    title: "数据与认证",
    description: "Drizzle schema、PostgreSQL/pgvector 基础模型、最小化会话抽象。",
  },
  {
    title: "AI 能力层",
    description: "模型目录、RAG 管线、Tool Registry、Chat Route Handler。",
  },
  {
    title: "业务模块",
    description: "聊天、知识库、Agent、Workflow、Dashboard 与设置中心。",
  },
] as const;
