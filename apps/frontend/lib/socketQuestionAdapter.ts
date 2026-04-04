import type { PublicQuestion } from "@/components/game/types";
import type { SocketQuestionWire } from "@/lib/multiplayerTypes";

/** Map server `packQuestionToPayload` shape to `QuestionRenderer` props. */
export function socketQuestionToPublicQuestion(
  q: SocketQuestionWire
): PublicQuestion {
  const t = q.type as PublicQuestion["type"];
  return {
    _id: q.id,
    type: t,
    category: "math",
    question: q.text,
    options: q.options?.length ? q.options : undefined,
    timeLimit: q.timeLimit,
    points: 10,
    tags: [],
  };
}
