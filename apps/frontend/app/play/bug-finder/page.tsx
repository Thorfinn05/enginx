"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { CodeWithBlank } from "@/components/bug-finder/CodeWithBlank";
import { CodeTerminal } from "@/components/ui/code-terminal";
import { useAuthState } from "@/lib/auth";
import {
  type CodeChallenge,
  checkBlankAnswer,
  getAllConcepts,
  pickBugFinderRun,
  pointsForBug,
} from "@/lib/codesPack";
import { useSession } from "@/lib/session";

type ResultRow = {
  id: string;
  title: string;
  selected: string;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  pointsEarned: number;
};

function BugFinderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useSession();
  const { isLoading, isAuthenticated, user } = useAuthState();
  const applyPoints = useMutation(api.quizGame.applyLocalQuizPoints);

  const concepts = useMemo(() => getAllConcepts(), []);
  const rawConcept = searchParams.get("concept") ?? "all";
  const concept =
    rawConcept === "all" || concepts.includes(rawConcept) ? rawConcept : "all";
  const count = Math.min(
    25,
    Math.max(1, Number(searchParams.get("count") ?? 5) || 5)
  );

  const questions = useMemo(
    () => pickBugFinderRun(concept, count),
    [concept, count]
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    pointsEarned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [runTotal, setRunTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<"running" | "done">("running");
  const [results, setResults] = useState<ResultRow[]>([]);

  const q = questions[index];

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [index, q?.id]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const userRow = useQuery(
    api.users.getCurrentUser,
    token ? { sessionToken: token } : "skip"
  );

  const onSubmit = useCallback(async () => {
    if (!token || !q || selected === null || submitting || feedback) return;
    setSubmitting(true);
    const correct = checkBlankAnswer(q, selected);
    const pointsEarned = pointsForBug(q, correct);
    const newStreak = correct ? streak + 1 : 0;

    try {
      await applyPoints({
        sessionToken: token,
        pointsEarned,
        streak: newStreak,
      });
    } catch {
      setFeedback({ correct: false, pointsEarned: 0 });
      setSubmitting(false);
      return;
    }

    setStreak(newStreak);
    setRunTotal((t) => t + pointsEarned);
    setResults((prev) => [
      ...prev,
      {
        id: q.id,
        title: q.title,
        selected,
        correct,
        correctAnswer: q.blanks[0]?.correctAnswer ?? "",
        explanation: q.explanation,
        pointsEarned,
      },
    ]);
    setFeedback({ correct, pointsEarned });
    setSubmitting(false);
  }, [
    token,
    q,
    selected,
    submitting,
    feedback,
    streak,
    applyPoints,
  ]);

  const advance = useCallback(() => {
    if (index + 1 >= questions.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
  }, [index, questions.length]);

  if (isLoading || !isAuthenticated || user === undefined) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#010828]">
        <p className="font-mono text-cream/60 text-sm">Loading…</p>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#010828]">
        <p className="font-mono text-cream/60 text-sm">Loading…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#010828] px-4 py-10">
        <Link href="/dashboard" className="font-mono text-sm text-neon hover:underline">
          ← Dashboard
        </Link>
        <p className="mt-6 max-w-md font-mono text-cream/70">
          No challenges for this filter. Try &quot;All concepts&quot; or add items to{" "}
          <code className="text-neon">apps/frontend/data/codes.json</code>.
        </p>
      </div>
    );
  }

  if (phase === "done") {
    const displayScore = userRow?.score ?? user.score ?? 0;
    return (
      <div className="min-h-[100dvh] bg-[#010828] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[24px] border border-white/15 bg-white/[0.06] p-6 text-center backdrop-blur-sm">
            <p className="font-mono text-xs uppercase tracking-widest text-cream/50">
              Bug finder complete
            </p>
            <p className="font-anton mt-2 text-3xl uppercase text-neon">Review</p>
            <p className="mt-4 font-mono text-cream">
              Run score ·{" "}
              <span className="text-xl font-semibold text-neon tabular-nums">
                {runTotal}
              </span>{" "}
              pts
            </p>
            <p className="mt-1 font-mono text-sm text-cream/65">
              Total · {displayScore} pts · streak · {userRow?.bestStreak ?? user.bestStreak ?? 0}
            </p>
          </div>

          <ul className="mt-8 space-y-4">
            {results.map((row, i) => (
              <li
                key={`${row.id}-${i}`}
                className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-cream/45">Q{i + 1}</span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase ${
                      row.correct
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-rose-500/20 text-rose-200"
                    }`}
                  >
                    {row.correct ? "Correct" : "Miss"}
                  </span>
                  {row.pointsEarned > 0 ? (
                    <span className="ml-auto font-mono text-xs text-neon">
                      +{row.pointsEarned}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 font-anton text-lg text-cream">{row.title}</p>
                <p className="mt-2 font-mono text-sm text-cream/80">
                  Your pick: <span className="text-cream">{row.selected}</span>
                </p>
                <p className="font-mono text-sm text-cream/90">
                  Answer: <span className="text-neon">{row.correctAnswer}</span>
                </p>
                <p className="mt-2 border-t border-white/10 pt-2 font-mono text-sm leading-relaxed text-cream/70">
                  {row.explanation}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-[12px] border border-white/20 px-5 py-3 font-anton uppercase text-cream hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/play/bug-finder"
              className="rounded-[12px] bg-neon px-5 py-3 font-anton uppercase text-[#010828]"
            >
              Play again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#010828]">
        <p className="font-mono text-cream/60 text-sm">Loading…</p>
      </div>
    );
  }

  const displayScore = userRow?.score ?? user.score ?? 0;
  const blankLabel = selected ?? null;

  return (
    <div className="relative min-h-[100dvh] bg-[#010828]">
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.07), transparent 50%)",
        }}
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#010828]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="font-mono text-xs text-neon hover:underline">
            ← Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-cream/80">
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-neon">
              {displayScore} pts
            </span>
            <span className="rounded-full border border-white/15 px-2.5 py-1">
              🔥 {streak}
            </span>
            <span className="rounded-full border border-white/15 px-2.5 py-1 tabular-nums">
              {index + 1}/{questions.length}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-6 pb-16">
        {feedback ? (
          <div
            className={`mb-6 rounded-[18px] border px-5 py-4 ${
              feedback.correct
                ? "border-emerald-400/40 bg-emerald-950/40"
                : "border-rose-400/40 bg-rose-950/40"
            }`}
          >
            <p className="font-anton text-lg uppercase text-cream">
              {feedback.correct ? "Correct" : "Not quite"}
            </p>
            {feedback.pointsEarned > 0 ? (
              <p className="mt-1 font-mono text-sm text-cream/90">
                +{feedback.pointsEarned} pts
              </p>
            ) : null}
            <p className="mt-2 font-mono text-sm text-cream/60">
              Full breakdown after the last challenge.
            </p>
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                advance();
              }}
              className="mt-4 w-full rounded-[12px] bg-neon py-3 font-anton uppercase text-[#010828]"
            >
              {index + 1 >= questions.length ? "See results" : "Next"}
            </button>
          </div>
        ) : null}

        {!feedback ? (
          <>
            <div className="mb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {q.concept} · {q.difficulty}
              </p>
              <h1 className="font-anton mt-1 text-2xl uppercase leading-tight text-cream sm:text-3xl">
                {q.title}
              </h1>
              <p className="mt-2 font-mono text-sm leading-relaxed text-cream/70">
                {q.description}
              </p>
            </div>

            <CodeTerminal title={`${q.id}.c`} subtitle="bug-finder · fill the blank">
              <CodeWithBlank
                codeTemplate={q.codeTemplate}
                blankDisplay={blankLabel}
              />
            </CodeTerminal>

            <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-cream/50">
              Pick the token for the blank
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {q.options.map((opt) => {
                const active = selected === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelected(opt)}
                    className={`rounded-xl border px-3 py-3 font-mono text-sm transition ${
                      active
                        ? "border-[#6fff00] bg-[#6fff00]/15 text-[#b7ff8c]"
                        : "border-white/15 bg-white/[0.05] text-cream hover:border-white/25 hover:bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={selected === null || submitting}
              onClick={() => void onSubmit()}
              className="mt-8 w-full rounded-[14px] bg-neon py-4 font-anton uppercase tracking-wide text-[#010828] shadow-[0_0_24px_rgba(111,255,0,0.2)] disabled:opacity-40"
            >
              {submitting ? "Checking…" : "Lock in"}
            </button>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default function BugFinderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#010828]">
          <p className="font-mono text-cream/60 text-sm">Loading…</p>
        </div>
      }
    >
      <BugFinderInner />
    </Suspense>
  );
}
