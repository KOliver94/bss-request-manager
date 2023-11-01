import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import * as Sentry from '@sentry/react';
import App from './App';
import theme from './assets/jss/theme';
import './assets/css/style.css';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_URL,
  });
}

ReactDOM.render(
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
  document.getElementById('root'),
);
