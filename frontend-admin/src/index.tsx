import { StrictMode } from 'react';

import * as Sentry from '@sentry/react';
import PrimeReact from 'primereact/api';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import './index.css';
import router from './router';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_URL,
  });
}

PrimeReact.ripple = true;

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
