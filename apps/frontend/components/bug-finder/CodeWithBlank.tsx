"use client";

import { cn } from "@/lib/utils";

type Props = {
  codeTemplate: string;
  /** Text shown in the blank (selected option or placeholder). */
  blankDisplay: string | null;
  /** Highlight when user locked an answer */
  revealed?: boolean;
  correct?: boolean;
};

/**
 * Renders `codeTemplate` with `{{b1}}` replaced by an inline blank chip.
 */
export function CodeWithBlank({
  codeTemplate,
  blankDisplay,
  revealed,
  correct,
}: Props) {
  const parts = codeTemplate.split(/\{\{b1\}\}/);

  return (
    <pre className="whitespace-pre-wrap break-all text-left">
      {parts.map((segment, i) => (
        <span key={i}>
          <span className="text-[#c9d1d9]">{segment}</span>
          {i < parts.length - 1 ? (
            <span
              className={cn(
                "mx-0.5 inline-flex min-h-[1.4em] min-w-[2.5rem] items-center justify-center rounded-md border px-2 align-middle text-[12px] font-semibold sm:text-[13px]",
                revealed === undefined
                  ? "border-[#6fff00]/45 bg-[#6fff00]/[0.12] text-[#7ee787]"
                  : correct
                    ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                    : "border-rose-400/45 bg-rose-500/15 text-rose-100"
              )}
            >
              {blankDisplay ?? "?"}
            </span>
          ) : null}
        </span>
      ))}
    </pre>
  );
}
