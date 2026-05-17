export const systemStatus = {
  architecture: "Next.js 16 单体架构 + App Router",
  storage: "PostgreSQL + pgvector schema 已扩展，MVP 运行态使用本地文件/JSON 持久化",
  auth: "NextAuth Credentials 已接入，工作台与 API 具备会话保护",
  chat: "DeepSeek / Qwen 路由、Zod 校验、流式响应、历史消息持久化",
  rag: "知识库上传、切片、Embedding、Hybrid Search、RRF 与引用式回答",
  dashboard: "CSV / Excel 上传、字段概览、预览与 Markdown 报告生成",
  workflow: "模板与运行记录占位保留，后续继续复用聊天与知识检索底层能力",
} as const;

export const mvpDecisions = [
  "以 PRD 中的 MVP 剪枝版为唯一实现基线。",
  "首期坚持单体 Next.js，不拆分微服务或 Monorepo。",
  "知识库首期仅接受 PDF / Markdown / DOCX / TXT。",
  "Dashboard 首期仅接受 CSV / Excel。",
  "认证使用 NextAuth，输入校验统一使用 Zod。",
  "模型方向优先 DeepSeek / Qwen，并为 text-embedding-v3 与 gte-rerank 预留统一配置。",
] as const;
