"use client";

import { useMemo, useState } from "react";
import { agentCatalog, knowledgeBaseCatalog, modelCatalog } from "@/lib/catalog";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ title: string; source: string }>;
};

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ChatWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content:
        "你好，我已经连上当前 MVP 工作区骨架。你可以试着问我如何推进聊天、知识库或 Agent 模块。",
    },
  ]);
  const [input, setInput] = useState("请概述当前 MVP 里聊天与知识库的落地顺序。");
  const [selectedModel, setSelectedModel] = useState(modelCatalog[0]?.id ?? "");
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(
    knowledgeBaseCatalog[0]?.id ?? "",
  );
  const [selectedAgent, setSelectedAgent] = useState(agentCatalog[0]?.id ?? "");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const helperText = useMemo(() => {
    const model = modelCatalog.find((item) => item.id === selectedModel);
    const knowledgeBase = knowledgeBaseCatalog.find((item) => item.id === selectedKnowledgeBase);
    const agent = agentCatalog.find((item) => item.id === selectedAgent);

    return [model?.label, knowledgeBase?.name, agent?.name].filter(Boolean).join(" · ");
  }, [selectedAgent, selectedKnowledgeBase, selectedModel]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: input.trim(),
    };

    const assistantId = createId();
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          modelId: selectedModel,
          knowledgeBaseId: selectedKnowledgeBase,
          agentId: selectedAgent,
          fileNames: selectedFiles,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("chat_request_failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const payload = JSON.parse(line) as
            | { type: "delta"; delta: string }
            | { type: "done"; citations: Array<{ title: string; source: string }> };

          if (payload.type === "delta") {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: `${message.content}${payload.delta}` }
                  : message,
              ),
            );
            continue;
          }

          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, citations: payload.citations }
                : message,
            ),
          );
        }
      }
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: "请求失败，请确认服务端配置与环境变量后重试。",
              }
            : message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <section>
          <p className="text-sm font-medium text-white">对话配置</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{helperText}</p>
        </section>

        <label className="block space-y-2 text-sm text-zinc-300">
          <span>模型</span>
          <select
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            {modelCatalog.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm text-zinc-300">
          <span>知识库</span>
          <select
            value={selectedKnowledgeBase}
            onChange={(event) => setSelectedKnowledgeBase(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            {knowledgeBaseCatalog.map((knowledgeBase) => (
              <option key={knowledgeBase.id} value={knowledgeBase.id}>
                {knowledgeBase.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm text-zinc-300">
          <span>Agent</span>
          <select
            value={selectedAgent}
            onChange={(event) => setSelectedAgent(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            {agentCatalog.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm text-zinc-300">
          <span>文件附件（预留）</span>
          <input
            type="file"
            multiple
            onChange={(event) => {
              const names = Array.from(event.target.files ?? []).map((file) => file.name);
              setSelectedFiles(names);
            }}
            className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-zinc-400"
          />
        </label>

        {selectedFiles.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
            {selectedFiles.map((name) => (
              <p key={name}>{name}</p>
            ))}
          </div>
        ) : null}
      </aside>

      <section className="flex min-h-[720px] flex-col rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="space-y-4 overflow-y-auto pr-2">
          {messages.map((message) => (
            <article
              key={message.id}
              className={message.role === "user" ? "ml-auto max-w-3xl" : "max-w-3xl"}
            >
              <div
                className={
                  message.role === "user"
                    ? "rounded-3xl bg-sky-400 px-5 py-4 text-slate-950"
                    : "rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-zinc-100"
                }
              >
                <p className="whitespace-pre-wrap text-sm leading-7">{message.content || "正在生成..."}</p>
              </div>
              {message.citations?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.citations.map((citation) => (
                    <span
                      key={`${message.id}-${citation.source}`}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                    >
                      {citation.title} · {citation.source}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-white/10 pt-6">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={4}
            className="w-full rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white outline-none placeholder:text-zinc-500"
            placeholder="输入你的问题，演示流式 Route Handler 会返回带引用的示例结果。"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">
              MVP 目标：流式问答、知识库上下文、模型切换、Tool Calling 预留。
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "生成中..." : "发送消息"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
