import { createBrowserRouter } from 'react-router-dom';
import AppTripulante from './apps/AppTripulante';
import LoginPage from './pages/Login';
import MiCuenta from './pages/MiCuenta'; // la que muestra estados + movimientos

function Protected({ children }: any) {
  const access = localStorage.getItem('access');
  if (!access) return <LoginPage />; // o <Navigate to="/login" replace />
  return children;
}

export const routerTripulante = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppTripulante />,
    children: [
      { index: true, element: <Protected><MiCuenta /></Protected> },
      { path: 'mi', element: <Protected><MiCuenta /></Protected> },
    ],
  },
]);
