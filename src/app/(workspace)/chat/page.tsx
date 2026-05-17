import { PageHeader } from "@/components/page-header";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";

export default function ChatPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Chat Center"
        title="聊天中心"
        description="已实现 MVP 级对话工作区：DeepSeek / Qwen 切换、知识库上下文、引用回答、历史消息与流式 Route Handler。"
      />
      <ChatWorkspace />
    </>
  );
}
