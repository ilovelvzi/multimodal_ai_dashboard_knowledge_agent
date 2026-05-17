export type ToolDefinition = {
  id: string;
  label: string;
  description: string;
  readiness: "ready" | "scaffolded" | "planned";
};

export const toolRegistry: ToolDefinition[] = [
  {
    id: "knowledge-search",
    label: "Knowledge Search",
    description: "检索文档切片并返回引用片段。",
    readiness: "ready",
  },
  {
    id: "http-request",
    label: "HTTP Request",
    description: "调用外部 API 或企业内部服务。",
    readiness: "scaffolded",
  },
  {
    id: "file-reader",
    label: "File Reader",
    description: "读取本地 / 对象存储文件元数据。",
    readiness: "planned",
  },
  {
    id: "workflow-runner",
    label: "Workflow Runner",
    description: "执行极简工作流节点链路。",
    readiness: "scaffolded",
  },
];
