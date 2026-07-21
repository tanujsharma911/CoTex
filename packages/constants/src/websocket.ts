export const MessageType = {
  EDIT: "edit",
  PING: "ping",
  PONG: "pong",
  DOC_UPDATE: "doc_update",
  EDITORS_UPDATE: "editors_update",
  CURSOR_MOVE: "cursor_move",
} as const;

export type MessageType =
  (typeof MessageType)[keyof typeof MessageType];
