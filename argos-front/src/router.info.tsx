import { createBrowserRouter } from 'react-router-dom';
import AppInfo from './apps/AppInfo';
import PublicHome from './pages/PublicHome';
import Contacto from './pages/Contacto';
import { Navigate } from 'react-router-dom';

export const routerInfo = createBrowserRouter([
  {
    path: '/',
    element: <AppInfo />,
    children: [
      { index: true, element: <PublicHome /> },
      { path: 'contacto', element: <Contacto /> },
      { path: '*', element: <Navigate to="/" replace /> },
      // "Miembros" va a link externo: https://tripulante.argonautas.org/login
    ],
  },
]);
