/** Payloads from `apps/backend` Socket.IO quiz flow. */

export type MultiplayerPlayer = {
  socketId: string;
  username: string;
  score: number;
};

export type GameStartedPayload = {
  roomId: string;
  players: MultiplayerPlayer[];
};

export type SocketQuestionWire = {
  id: string;
  type: string;
  text: string;
  options: string[];
  timeLimit: number;
};

export type QuestionEventPayload = {
  questionIndex: number;
  totalQuestions: number;
  question: SocketQuestionWire;
};

export type AnswerScoreEntry = {
  answer: string | null;
  isCorrect: boolean;
  points: number;
};

export type AnswerTimeUpPayload = {
  correctAnswer: string;
  scores: Record<string, AnswerScoreEntry>;
};

export type LeaderboardEntry = {
  userId: string;
  username: string;
  score: number;
};

export type GameEndedPayload = {
  finalLeaderboard: LeaderboardEntry[];
  message: string;
};

export type JoinGameAck =
  | { status: "waiting" }
  | { status: "game_started"; roomId: string }
  | { status: "error"; message?: string };
