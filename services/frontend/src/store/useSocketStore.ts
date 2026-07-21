import type { SocketStore } from "@/types";
import { create } from "zustand";

const handleConnect = ({
  token,
  url,
  docId,
  get,
  set,
}: {
  token: string;
  url: string;
  docId: string;
  get: () => SocketStore;
  set: (state: Partial<SocketStore>) => void;
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
    console.log("useWebSocket :: connection established");
    set({ isConnected: true });
  };

  ws.onclose = () => {
    console.log("useWebSocket :: connection closed");
    set({ isConnected: false });
  };

  ws.onerror = (error) => {
    console.error("useWebSocket :: connection error", error);
    set({ isConnected: false });
  };

  return ws;
};

const handleDisconnect = ({
  get,
  set,
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

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  connect: ({
    token,
    url,
    docId,
  }: {
    token: string;
    url: string;
    docId: string;
  }) => handleConnect({ token, url, docId, get, set }),
  disconnect: () => handleDisconnect({ get, set }),
  setSocket: (socket: WebSocket | null) => set({ socket }),
  setIsConnected: (isConnected: boolean) => set({ isConnected }),
}));
