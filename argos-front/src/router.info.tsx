import { createBrowserRouter } from 'react-router-dom';
import AppInfo from './apps/AppInfo';
import PublicHome from './pages/PublicHome';
import Contacto from './pages/Contacto';

export const routerInfo = createBrowserRouter([
  {
    path: '/',
    element: <AppInfo />,
    children: [
      { index: true, element: <PublicHome /> },
      { path: 'contacto', element: <Contacto /> },
      // "Miembros" va a link externo: https://tripulante.argonautas.org/login
    ],
  },
]);
