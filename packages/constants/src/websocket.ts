export const MessageType = {
  EDIT: 'edit',
  PING: 'ping',
  PONG: 'pong',
  DOC_UPDATE: 'doc_update',
  SYNC_STEP1: 'sync_step_1',
  SYNC_STEP2: 'sync_step_2',
  EDITORS_UPDATE: 'editors_update',
  CURSOR_MOVE: 'cursor_move',
  CONNECTION_READY: 'connection_ready'
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];
