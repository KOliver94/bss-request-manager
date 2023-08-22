import { StrictMode } from 'react';

import * as Sentry from '@sentry/react';
import * as locales from 'primelocale/hu.json';
import { PrimeReactProvider, addLocale, locale } from 'primereact/api';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { register } from 'timeago.js';
import huLocal from 'timeago.js/lib/lang/hu';

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

addLocale('hu', locales['hu']);
locale('hu');

register('hu_HU', huLocal);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <PrimeReactProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </PrimeReactProvider>
  </StrictMode>,
);
