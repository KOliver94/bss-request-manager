import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import * as Sentry from '@sentry/react';
import router from './router';
import ServiceWorkerUpdate from './components/ServiceWorkerUpdate';
import theme from './assets/jss/theme';

import 'src/assets/scss/custom-icon-font.scss';
import 'src/assets/scss/material-kit-react.scss';

if (import.meta.env.PROD) {
  Sentry.init({
    beforeSend(event) {
      // Check if it is an exception, and if so, show the report dialog
      if (event.exception) {
        Sentry.showReportDialog({
          eventId: event.event_id,
        });
      }
      return event;
    },
    dsn: import.meta.env.VITE_SENTRY_URL,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        createRoutesFromChildren,
        matchRoutes,
        useEffect,
        useLocation,
        useNavigationType,
      }),
    ],
  });
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          preventDuplicate
          autoHideDuration={5000}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <ServiceWorkerUpdate />
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
