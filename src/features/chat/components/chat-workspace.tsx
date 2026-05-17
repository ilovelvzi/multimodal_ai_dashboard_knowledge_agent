"use client";

import { useEffect, useMemo, useState } from "react";
import { agentCatalog, knowledgeBaseCatalog, modelCatalog } from "@/lib/catalog";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ title: string; source: string; excerpt?: string; score?: number }>;
};

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ChatWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("请概述当前 MVP 里聊天与知识库的落地顺序。");
  const [selectedModel, setSelectedModel] = useState(modelCatalog[0]?.id ?? "");
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(knowledgeBaseCatalog[0]?.id ?? "");
  const [selectedAgent, setSelectedAgent] = useState(agentCatalog[0]?.id ?? "");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      const response = await fetch("/api/chat?limit=20", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { chatId: string | null; messages: ChatMessage[] };
      if (cancelled) {
        return;
      }

      setChatId(payload.chatId);
      if (payload.messages.length > 0) {
        setMessages(payload.messages);
        return;
      }

      setMessages([
        {
          id: createId(),
          role: "assistant",
          content: "你好，我已经连上当前 MVP 工作区。你可以直接针对知识库、数据集或 Agent 提问。",
        },
      ]);
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

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
    setMessages((current) => [...current, userMessage, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
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
            | {
                type: "done";
                chatId: string;
                citations: Array<{ title: string; source: string; excerpt?: string; score?: number }>;
              };

          if (payload.type === "delta") {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId ? { ...message, content: `${message.content}${payload.delta}` } : message,
              ),
            );
            continue;
          }

          setChatId(payload.chatId);
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, citations: payload.citations } : message,
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
                content: "请求失败，请确认登录状态、模型配置与知识库数据后重试。",
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
          <span>附件占位</span>
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
            <article key={message.id} className={message.role === "user" ? "ml-auto max-w-3xl" : "max-w-3xl"}>
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
                <div className="mt-3 space-y-2">
                  {message.citations.map((citation) => (
                    <div
                      key={`${message.id}-${citation.source}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300"
                    >
                      <p>{citation.title} · {citation.source}</p>
                      {citation.excerpt ? <p className="mt-1 text-zinc-400">{citation.excerpt}</p> : null}
                    </div>
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
            placeholder="输入你的问题，系统会基于选定知识库执行 Hybrid Search 并流式返回答案。"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">MVP 目标：DeepSeek / Qwen、知识库上下文、引用回答、历史消息持久化。</p>
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
