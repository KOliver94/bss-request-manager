import { StrictMode, useEffect } from 'react';

import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as locales from 'primelocale/hu.json';
import { PrimeReactProvider, addLocale, locale } from 'primereact/api';
import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { register } from 'timeago.js';
import huLocal from 'timeago.js/lib/lang/hu';

import { getName } from 'helpers/LocalStorageHelper';
import { AuthenticationProvider } from 'providers/AuthenticationProvider';
import { ThemeProvider } from 'providers/ThemeProvider';
import { ToastProvider } from 'providers/ToastProvider';
import router, { queryClient } from 'router';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import 'index.css';

if (import.meta.env.PROD) {
  Sentry.init({
    beforeSend(event) {
      // Check if it is an exception, and if so, show the report dialog
      if (event.exception) {
        Sentry.showReportDialog({
          eventId: event.event_id,
          user: {
            name: getName(),
          },
        });
      }
      return event;
    },
    dsn: import.meta.env.VITE_SENTRY_URL_ADMIN,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        ),
      }),
    ],
  });
}

addLocale('hu', locales['hu']);
locale('hu');

register('hu_HU', huLocal);

const primeReactSettings = {
  ripple: true,
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <AuthenticationProvider>
      <PrimeReactProvider value={primeReactSettings}>
        <ThemeProvider>
          <ToastProvider>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
              <ReactQueryDevtools />
            </QueryClientProvider>
          </ToastProvider>
        </ThemeProvider>
      </PrimeReactProvider>
    </AuthenticationProvider>
  </StrictMode>,
);
