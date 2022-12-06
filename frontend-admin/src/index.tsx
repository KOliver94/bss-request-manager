import { StrictMode } from 'react';

import * as Sentry from '@sentry/react';
import PrimeReact, { addLocale, locale } from 'primereact/api';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import * as locales from 'locales.json';
import router from 'router';
import { ThemeProvider } from 'themes/ThemeProvider';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import 'index.css';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_URL,
  });
}

PrimeReact.ripple = true;
addLocale('hu', locales['hu']);
locale('hu');

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
