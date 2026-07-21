import { createRoot } from 'react-dom/client';
import './index.css';

import React, { Suspense } from 'react';
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).define = (window as any).define || function () {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).define.amd = true;
}

import { createBrowserRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProtectedLayout } from './components/ProtectedLayout';
const App = React.lazy(() => import('./App'));
const Home = React.lazy(() => import('./pages/Home'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Editor = React.lazy(() => import('./pages/Editor'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Login = React.lazy(() => import('./pages/Login'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Signup = React.lazy(() => import('./pages/Signup'));

const queryClient = new QueryClient();

const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: '',
        element: (
          <Suspense>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedLayout>
            <Suspense>
              <Profile />
            </Suspense>
          </ProtectedLayout>
        )
      },
      {
        path: 'edit/:docId',
        element: (
          <ProtectedLayout>
            <Suspense>
              <Editor />
            </Suspense>
          </ProtectedLayout>
        )
      },
      {
        path: 'project',
        element: (
          <ProtectedLayout>
            <Suspense>
              <Projects />
            </Suspense>
          </ProtectedLayout>
        )
      },
      {
        path: 'login',
        element: (
          <Suspense>
            <Login />
          </Suspense>
        )
      },
      {
        path: 'signup',
        element: (
          <Suspense>
            <Signup />
          </Suspense>
        )
      },
      {
        path: '*',
        element: (
          <Suspense>
            <NotFound />
          </Suspense>
        )
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={routes} />
  </QueryClientProvider>
);
