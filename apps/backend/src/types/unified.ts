import type { Server } from "socket.io";

/** Extensible server-side game status for Socket.IO rooms. */
export type UnifiedGameStatus = "lobby" | "running" | "ended";

export type PresenceUserWire = {
  userId: string;
  username: string;
};

export type ChallengeWire = {
  challengeId: string;
  fromUserId: string;
  fromUsername: string;
  targetUserId: string;
  createdAt: number;
};

export type ScoreMapWire = Record<string, number>;

export type UnifiedGameServiceApi = {
  registerPresence(
    socketId: string,
    userId: string,
    username: string
  ): void;
  removeSocket(socketId: string): void;
  broadcastPresence(): void;
  enqueueQuickMatch(
    socketId: string,
    userId: string,
    username: string,
    gameType: string
  ): { status: "waiting" } | { status: "matched"; roomId: string };
  requestChallenge(
    fromSocketId: string,
    fromUserId: string,
    fromUsername: string,
    targetUserId: string
  ): { ok: true; challengeId: string } | { ok: false; error: string };
  respondChallenge(
    socketId: string,
    userId: string,
    challengeId: string,
    accepted: boolean
  ):
    | { ok: true; roomId?: string }
    | { ok: false; error: string };
  resumeRoom(
    socketId: string,
    userId: string,
    roomId: string
  ): boolean;
  submitAnswer(
    roomId: string,
    userId: string,
    roundIndex: number,
    answer: string,
    clientTs: number | undefined,
    serverReceivedAt: number
  ): { ok: true } | { ok: false; reason: string };
  getRoomSnapshotForUser(
    roomId: string,
    userId: string
  ): Record<string, unknown> | null;
};

export type UnifiedGameServiceFactory = (io: Server) => UnifiedGameServiceApi;
