import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { detectVariant } from './variant';
import { routerInfo } from './router.info';
import { routerTripulante } from './router.tripulante';
import { routerCamara } from './router.camara';

const theme = createTheme({ palette: { mode: 'light', primary: { main: '#1976d2' } } });

const variant = detectVariant();
const router =
  variant === 'info' ? routerInfo :
  variant === 'tripulante' ? routerTripulante :
  routerCamara;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
