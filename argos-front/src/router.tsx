import type { ReactElement } from "react";
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/Login';
import Miembros from './pages/Miembros';
import TablaEstados from './pages/TablaEstados';
import Proyeccion from './pages/Proyeccion';
import Tesoreria from './pages/Tesoreria';

function Protected({ children }: { children: ReactElement }) {
  const access = localStorage.getItem('access');
  if (!access) return <Navigate to="/login" replace />;
  return children;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Protected><Miembros /></Protected> },
      { path: 'tabla', element: <Protected><TablaEstados /></Protected> },
      { path: 'proyeccion', element: <Protected><Proyeccion /></Protected> },
      { path: 'tesoreria', element: <Protected><Tesoreria /></Protected> },
    ],
  },
]);
