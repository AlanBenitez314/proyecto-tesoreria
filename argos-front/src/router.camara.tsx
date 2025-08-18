import { createBrowserRouter } from 'react-router-dom';
import App from './App'; // tu App actual con Miembros/Tabla/Proyección/Tesorería
import LoginPage from './pages/Login';
import Miembros from './pages/Miembros';
import TablaEstados from './pages/TablaEstados';
import Proyeccion from './pages/Proyeccion';
import Tesoreria from './pages/Tesoreria';
import Movimientos from './pages/Movimientos';
import { Navigate } from 'react-router-dom';

function Protected({ children }: any) {
  const access = localStorage.getItem('access');
  if (!access) return <Navigate to="/login" replace />;
  return children;
}

export const routerCamara = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Protected><Miembros /></Protected> },
      { path: 'tabla', element: <Protected><TablaEstados /></Protected> },
      { path: 'proyeccion', element: <Protected><Proyeccion /></Protected> },
      { path: 'tesoreria', element: <Protected><Tesoreria /></Protected> },
      { path: 'movimientos', element: <Protected><Movimientos /></Protected> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
