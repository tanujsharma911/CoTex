import type { AuthUser } from "@/types";

const AUTH_STORAGE_KEY = "collab_editor_auth";

interface StoredAuthSession {
  user: AuthUser;
  token: string;
}

const saveAuthInLocalStorage = (session: StoredAuthSession) => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const getLocalStorageAuth = (): StoredAuthSession | null => {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;

    if (!parsed.user || !parsed.token) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      user: parsed.user,
      token: parsed.token,
    };
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const clearAuthInLocalStorage = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export { clearAuthInLocalStorage, getLocalStorageAuth, saveAuthInLocalStorage };
