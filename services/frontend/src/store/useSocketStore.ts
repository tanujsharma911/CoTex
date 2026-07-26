import type { SocketStore } from '@/types';
import { create } from 'zustand';

const handleConnect = ({
  token,
  url,
  docId,
  get,
  set,
  messageListeners,
  connectListeners
}: Parameters<SocketStore['connect']>[0] & {
  get: () => SocketStore;
  set: (state: Partial<SocketStore>) => void;
  messageListeners: Set<(event: MessageEvent) => void>;
  connectListeners: Set<() => void>;
}) => {
  const state = get();

  if (
    state.socket &&
    (state.socket.readyState === WebSocket.OPEN ||
      state.socket.readyState === WebSocket.CONNECTING)
  ) {
    return state.socket;
  }

  const ws = new WebSocket(`${url}?token=${token}&docId=${docId}`);

  set({ socket: ws });

  ws.onopen = () => {
    console.log('useWebSocket :: connection established');
    set({ isConnected: true });
    connectListeners.forEach((listener) => listener());
  };

  ws.addEventListener('message', (event) => {
    messageListeners.forEach((listener) => listener(event));
  });

  ws.onclose = () => {
    console.log('useWebSocket :: connection closed');
    set({ isConnected: false });
  };

  ws.onerror = (error) => {
    console.error('useWebSocket :: connection error', error);
    set({ isConnected: false });
  };

  return ws;
};

const handleDisconnect = ({
  get,
  set
}: {
  get: () => SocketStore;
  set: (state: Partial<SocketStore>) => void;
}) => {
  const state = get();

  if (state.socket) {
    state.socket.close();
    set({ socket: null, isConnected: false });
  }
};

export const useSocketStore = create<SocketStore>((set, get) => {
  const messageListeners = new Set<(event: MessageEvent) => void>();
  const connectListeners = new Set<() => void>();

  return {
    socket: null,

    isConnected: false,

    connect: (args) =>
      handleConnect({
        ...args,
        get,
        set,
        messageListeners,
        connectListeners
      }),

    send: (message) => get().socket?.send(JSON.stringify(message)),

    onMessage: (callback: (event: MessageEvent) => void) => {
      messageListeners.add(callback);
      return () => messageListeners.delete(callback);
    },

    onConnect: (callback: () => void) => {
      connectListeners.add(callback);
      return () => connectListeners.delete(callback);
    },

    disconnect: () => handleDisconnect({ get, set })
  };
});
