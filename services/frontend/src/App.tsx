import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import './index.css';
import './components/Editor/styles.css';

loader.config({ monaco });

import { useAuthStore } from './store/useAuthStore.ts';
import { NavBar } from './components/NavBar.tsx';
import { backendApi } from './services/backendApi.ts';
import { getLocalStorageAuth } from './lib/authStorage.ts';
import { useThemeStore } from './store/useThemeStore.ts';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen grid grid-rows-[auto_1fr] relative min-h-screen">
      <NavBar />
      {children}
      <Toaster richColors />
    </div>
  );
}

const App = () => {
  const navigate = useNavigate();

  const { login, logout, isLoading, setLoading } = useAuthStore();
  const themeStore = useThemeStore();

  const fetchUser = async (token: string) => {
    if (!token) {
      logout();
      return;
    }

    try {
      const userData = await backendApi.getMe(token);

      login(userData.data.data, token);
    } catch {
      logout();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    themeStore.init();

    setLoading(true);

    const session = getLocalStorageAuth();

    if (!session) {
      setLoading(false);
      return;
    }

    fetchUser(session.token);
  }, []);

  if (isLoading) {
    return <div className="text-center my-20">Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
};

export default App;
