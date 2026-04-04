import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { QuestionJson, QuestionPackFile } from "./packQuestion.js";
import { questionBank } from "./questionBank.js";

/** Bun provides `import.meta.dir`; path to this file's directory. */
const __dirname = import.meta.dir;

/** Pack files under repo `packages/` (same source as Convex seed). `codes.json` is a different shape and is skipped. */
const PACK_FILENAMES = [
  "maths.json",
  "aiml.json",
  "cs_fundamental.json",
  "programming.json",
] as const;

function repoRootFromThisModule(): string {
  return join(__dirname, "..", "..", "..", "..");
}

function isPackFile(data: unknown): data is QuestionPackFile {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  const qs = o.questions;
  if (!Array.isArray(qs) || qs.length === 0) return false;
  const first = qs[0];
  if (!first || typeof first !== "object") return false;
  const q = first as Record<string, unknown>;
  return (
    typeof q.id === "string" &&
    typeof q.question === "string" &&
    typeof q.answer === "string"
  );
}

let cachedPool: QuestionJson[] | null = null;

/**
 * Load and merge all canonical question packs from `packages/*.json`.
 */
export function loadPackQuestions(): QuestionJson[] {
  if (cachedPool) return cachedPool;

  const root = repoRootFromThisModule();
  const packagesDir = join(root, "packages");
  const merged: QuestionJson[] = [];

  for (const name of PACK_FILENAMES) {
    const path = join(packagesDir, name);
    if (!existsSync(path)) {
      console.warn(`[packLoader] Missing pack file: ${path}`);
      continue;
    }
    try {
      const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
      if (!isPackFile(raw)) {
        console.warn(`[packLoader] Skip invalid pack shape: ${name}`);
        continue;
      }
      merged.push(...raw.questions);
    } catch (e) {
      console.warn(`[packLoader] Failed to read ${name}:`, e);
    }
  }

  if (merged.length === 0) {
    const legacy = questionBank.map(
      (q): QuestionJson => ({
        id: q.id,
        type: "mcq",
        category: "math",
        topic: "mixed",
        difficulty: "medium",
        question: q.text,
        options: q.options,
        answer: q.correctAnswer,
        explanation: "",
        timeLimit: q.timeLimit,
        points: 10,
        tags: [],
        createdAt: Date.now(),
        source: "local",
        isFallback: true,
      })
    );
    cachedPool = legacy;
    console.warn(
      `[packLoader] No questions in packages/ — using ${legacy.length} built-in MCQs.`
    );
  } else {
    cachedPool = merged;
    console.log(
      `[packLoader] Loaded ${merged.length} questions from packages/*.json`
    );
  }
  return cachedPool!;
}

/** Deterministic shuffle (same seed → same order for both players in a room). */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  const next = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export type PackCategory = QuestionJson["category"];

/**
 * Pick a random run of questions for one match: shuffle with room seed, then take `count`.
 * Optional `category` filters to one subject (same as solo quiz categories).
 */
export function pickRoundQuestions(
  count: number,
  roomSeed: string,
  category?: PackCategory
): QuestionJson[] {
  const pool = loadPackQuestions();
  let filtered =
    category !== undefined
      ? pool.filter((q) => q.category === category)
      : pool;

  if (filtered.length === 0) {
    filtered = pool;
  }

  const n = Math.min(Math.max(count, 1), 50, filtered.length);
  const shuffled = seededShuffle(filtered, roomSeed);
  return shuffled.slice(0, n);
}
