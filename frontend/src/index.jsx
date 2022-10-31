import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import * as Sentry from '@sentry/react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import App from './App';
import theme from './assets/jss/theme';
import './assets/css/style.css';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_URL,
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
