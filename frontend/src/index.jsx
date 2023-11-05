import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import * as Sentry from '@sentry/react';
import App from './App';
import theme from './assets/jss/theme';

import 'src/assets/scss/custom-icon-font.scss';
import 'src/assets/scss/material-kit-react.scss';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_URL,
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
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
