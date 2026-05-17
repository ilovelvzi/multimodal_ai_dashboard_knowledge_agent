export type Citation = {
  title: string;
  excerpt: string;
  source: string;
};

export type RagAnswer = {
  summary: string;
  citations: Citation[];
  steps: string[];
};
