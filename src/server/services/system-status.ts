export const systemStatus = {
  architecture: "Next.js 16 单体架构",
  storage: "PostgreSQL + pgvector（已完成 schema/migration 脚手架）",
  auth: "基础会话抽象已预留，生产鉴权待接入 Better Auth / NextAuth",
  chat: "已具备流式对话 Route Handler 与前端工作区",
  rag: "已具备知识库目录、RAG pipeline 占位与引用生成逻辑",
  workflow: "已具备模板清单、节点能力说明与运行记录占位",
  dashboard: "已具备数据集视图、图表摘要与 AI Insight 卡片",
} as const;

export const mvpDecisions = [
  "以 PRD 中的 MVP 剪枝版为唯一实现基线。",
  "首期坚持单体 Next.js，不拆分微服务或 Monorepo。",
  "多租户、复杂 RBAC、复杂 DAG、多 Agent 协作全部延后。",
  "优先覆盖聊天、知识库、Agent、Workflow、Dashboard 五大闭环。",
] as const;
