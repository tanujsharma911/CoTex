export interface docType {
    _id: string;
    name: string;
    data: BufferSource;
    visibility: 'private' | 'public';
    pdf: { type: 'Buffer'; data: number[] };
    ownerId: string;
    deleted: false;
    createdAt: string;
    updatedAt: string;
    ydocData: { type: 'Buffer'; data: number[] };
  }
  
  export interface editingUser {
    name: string;
    userId: string;
    selection: {
      anchor?: {
        lineNumber?: number;
        column?: number;
      };
      head?: {
        lineNumber?: number;
        column?: number;
      };
    };
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
    connect: ({
      token,
      url,
      docId
    }: {
      token: string;
      url: string;
      docId: string;
    }) => void;
    disconnect: () => void;
    setSocket: (socket: WebSocket | null) => void;
    setIsConnected: (isConnected: boolean) => void;
  }
  
  export interface ThemeStore {
    theme: 'dark' | 'light';
    toggle: () => 'dark' | 'light';
    init: () => void;
  }
  