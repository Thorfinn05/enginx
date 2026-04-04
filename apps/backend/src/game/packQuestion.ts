/**
 * Aligns with `apps/frontend/convex/seed/questionPack.ts` / `packages/*.json`.
 */
export type QuestionJson = {
  id: string;
  type: "mcq" | "code_output" | "debug" | "math";
  category: "aiml" | "cs_fundamentals" | "programming" | "math";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  timeLimit: number;
  points: number;
  tags: string[];
  createdAt: string | number;
  source: "gemini" | "local";
  isFallback: boolean;
};

export type QuestionPackFile = {
  meta: { version: string; lastUpdated: string };
  questions: QuestionJson[];
};
