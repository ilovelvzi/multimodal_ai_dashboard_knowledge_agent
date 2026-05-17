# Multimodal AI Dashboard Knowledge Agent

基于 PRD 的 MVP 剪枝版，这个仓库当前实现的是一个 **Next.js 16 单体式平台骨架**，用于承载以下核心模块：

- AI Chat Center
- Knowledge Base / RAG
- Agent System
- Minimal Workflow
- Dashboard
- Settings / Environment Foundation

## 当前已落地内容

- `src/app` App Router 页面结构
- 统一工作台导航与暗色视觉框架
- NextAuth Credentials 登录、受保护工作台与 API 鉴权
- 聊天中心页面与 `/api/chat` 流式 Route Handler（DeepSeek / Qwen 路由、历史消息持久化、引用式回答）
- 知识库上传链路：PDF / Markdown / DOCX / TXT、切片、Embedding、Hybrid Search、RRF、SSE 进度推送
- Dashboard 上传链路：CSV / Excel 解析、字段概览、预览与 Markdown 报告
- `src/server` 下的 config / auth / ai / rag / tools / services 基础模块
- Drizzle schema、`drizzle.config.ts` 与初始 SQL migration 脚手架
- `.env.example` 运行时配置模板

## 技术基线

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- PostgreSQL + pgvector（schema / migration 已预留）
- NextAuth
- Zod

## 快速开始

```bash
corepack prepare pnpm@10.12.4 --activate
pnpm install
cp .env.example .env.local
pnpm dev
```

默认开发账号：

- `admin@example.com / ChangeMe123!`
- `member@example.com / ChangeMe123!`

访问：

- `/` 首页
- `/login` 登录页骨架
- `/dashboard` 工作台
- `/chat` AI 聊天中心
- `/knowledge` 知识库系统
- `/agents` Agent 管理
- `/workflow` 极简工作流
- `/settings` 系统设置
- `/api/health` 健康检查

## 常用命令

```bash
pnpm lint
pnpm build
pnpm db:check
pnpm drizzle-kit generate
```

## 目录结构

```text
src/
  app/
  components/
  features/
  lib/
  server/
drizzle/
```

## 当前 MVP 边界

1. 认证采用 NextAuth Credentials
2. 聊天主路径聚焦 DeepSeek / Qwen
3. 知识库首期仅接受 PDF / Markdown / DOCX / TXT
4. Dashboard 首期仅接受 CSV / Excel
5. 输入校验统一使用 Zod
