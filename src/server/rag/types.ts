export type Citation = {
  title: string;
  excerpt: string;
  source: string;
  score?: number;
};

export type RagAnswer = {
  summary: string;
  citations: Citation[];
  steps: string[];
  context: string[];
};
