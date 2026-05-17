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
- 聊天中心页面与 `/api/chat` 流式 Route Handler 示例
- 知识库、Agent、Workflow、Dashboard、登录与设置页面骨架
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

## 快速开始

```bash
corepack prepare pnpm@10.12.4 --activate
pnpm install
cp .env.example .env.local
pnpm dev
```

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

## 后续建议优先级

1. 接入真实认证（Better Auth / NextAuth）
2. 替换 `/api/chat` 的示例流为真实 AI Provider 调用
3. 完成 PDF 上传、解析、切片和向量写入链路
4. 把 Agent / Workflow / Dashboard 的占位逻辑替换为真实服务层
5. 建立真实 migration 流程、测试与部署配置
