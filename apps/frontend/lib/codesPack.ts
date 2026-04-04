import codesRaw from "@/data/codes.json";

export type CodeChallenge = {
  id: string;
  type: string;
  difficulty: string;
  concept: string;
  title: string;
  description: string;
  codeTemplate: string;
  blanks: { id: string; correctAnswer: string }[];
  options: string[];
  hint?: string;
  explanation: string;
};

const ALL = codesRaw as CodeChallenge[];

export function getAllConcepts(): string[] {
  const s = new Set<string>();
  for (const q of ALL) s.add(q.concept);
  return [...s].sort();
}

export function pickBugFinderRun(
  concept: "all" | string,
  count: number
): CodeChallenge[] {
  const pool =
    concept === "all"
      ? [...ALL]
      : ALL.filter((q) => q.concept === concept);
  if (pool.length === 0) return [];
  const shuffled = shuffle(pool);
  const n = Math.min(Math.max(count, 1), 25, shuffled.length);
  return shuffled.slice(0, n);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function checkBlankAnswer(q: CodeChallenge, selected: string): boolean {
  const expected = q.blanks[0]?.correctAnswer?.trim();
  if (!expected) return false;
  return selected.trim() === expected;
}

/** Points for bug-finder (simple scale). */
export function pointsForBug(q: CodeChallenge, correct: boolean): number {
  if (!correct) return 0;
  if (q.difficulty === "hard") return 120;
  if (q.difficulty === "medium") return 100;
  return 80;
}
