import type { DocumentProcessStage } from "@/server/config/mvp";

export type KnowledgeProgressEvent = {
  documentId: string;
  stage: DocumentProcessStage;
  progress: number;
  message: string;
  error?: string;
  completed: boolean;
};

type Listener = (event: KnowledgeProgressEvent) => void;

const listeners = new Map<string, Set<Listener>>();
const latestEvents = new Map<string, KnowledgeProgressEvent>();

export function publishKnowledgeProgress(event: KnowledgeProgressEvent) {
  latestEvents.set(event.documentId, event);
  const subscribers = listeners.get(event.documentId);
  subscribers?.forEach((listener) => listener(event));
}

export function getLatestKnowledgeProgress(documentId: string) {
  return latestEvents.get(documentId);
}

export function subscribeKnowledgeProgress(documentId: string, listener: Listener) {
  const subscribers = listeners.get(documentId) ?? new Set<Listener>();
  subscribers.add(listener);
  listeners.set(documentId, subscribers);

  return () => {
    const current = listeners.get(documentId);
    current?.delete(listener);
    if (current && current.size === 0) {
      listeners.delete(documentId);
    }
  };
}
