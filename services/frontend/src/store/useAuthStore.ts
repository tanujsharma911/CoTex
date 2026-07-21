import { create } from 'zustand';

import {
  clearAuthInLocalStorage,
  saveAuthInLocalStorage
} from '../lib/authStorage';
import type { AuthStore, AuthUser } from '@/types';

const useAuthStore = create<AuthStore>()((set) => ({
  user: undefined,
  token: undefined,
  isAuthenticated: false,
  isLoading: true,

  login: (user: AuthUser, token: string) => {
    saveAuthInLocalStorage({ user, token });

    set({
      user,
      token,
      isAuthenticated: true
    });
  },
  logout: () => {
    clearAuthInLocalStorage();

    set({
      user: undefined,
      token: undefined,
      isAuthenticated: false
    });
  },
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  }
}));

export { useAuthStore };
