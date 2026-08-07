import type { docType, editingUser } from '@cotex/types';
import type { UseMutationResult } from '@tanstack/react-query';

/**
 * loading-doc: Fetching doc data from API
 * connecting: Connecting to socket
 * syncing: Waiting for SYNC_STEP2
 * ready: Ready to use
 * error: Error fetching doc data
 */
export type EditorStatus =
  | 'loading-doc'
  | 'connecting'
  | 'syncing'
  | 'ready'
  | 'error';

export interface MenuBarProps {
  editors: editingUser[];
  docData: docType | undefined;
  fetchDocData: UseMutationResult<any, any, void, unknown>;
  compileCode: UseMutationResult<any, any, void, unknown>;
  downloadPDF: UseMutationResult<any, any, void, unknown>;
}

export interface AuthUser {
  _id?: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface AuthPayload {
  user: AuthUser;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LogoutPayload {
  success: boolean;
  message: string;
}

export interface AuthStore {
  user: AuthUser | undefined;
  token: string | undefined;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

export interface SocketStore {
  socket: WebSocket | null;
  isConnected: boolean;
  onMessage: (callback: (event: MessageEvent) => void) => () => void;
  onConnect: (callback: () => void) => () => void;
  connect: ({
    token,
    url,
    docId,
    onOpen,
    onClose,
    onError
  }: {
    token: string;
    url: string;
    docId: string;
    onMessage?: (event: MessageEvent) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
  }) => void;
  send: (message: Object) => void;
  disconnect: () => void;
}

export interface ThemeStore {
  theme: 'dark' | 'light';
  toggle: () => 'dark' | 'light';
  init: () => void;
}

export type FileTreeItem =
  | { name: string }
  | { name: string; items: FileTreeItem[] };
