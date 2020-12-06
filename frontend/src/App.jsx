import { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {
  primaryColor,
  roseColor as secondaryColor,
  dangerColor as errorColor,
  warningColor,
  infoColor,
  successColor,
  grayColor,
} from 'assets/jss/material-kit-react';
import { checkRefreshTokenValid } from './api/loginApi';

import AuthenticatedRoute from './components/AuthenticatedRoute';
import AdminRoute from './components/AdminRoute';

import PageNotFound from './views/PageNotFound/PageNotFound';
import LandingPage from './views/LandingPage/LandingPage';
import LoginPage from './views/LoginPage/LoginPage';
import RequestCreatorPage from './views/RequestCreatorPage/RequestCreatorPage';
import MyRequestsPage from './views/MyRequestsPage/MyRequestsPage';
import RequestDetailPage from './views/RequestDetailPage/RequestDetailPage';

import 'assets/scss/material-kit-react.scss';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    error: {
      main: errorColor,
    },
    warning: {
      main: warningColor,
    },
    info: {
      main: infoColor,
    },
    success: {
      main: successColor,
    },
    grey: {
      main: grayColor,
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token') && checkRefreshTokenValid()
  );
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/">
            <LandingPage
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </Route>
          <Route path="/login">
            <LoginPage
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </Route>
          <Route exact path="/new-request">
            <RequestCreatorPage
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </Route>
          <AuthenticatedRoute exact path="/my-requests">
            <MyRequestsPage
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/my-requests/:id">
            <RequestDetailPage
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/admin/requests">
            <AdminRoute>
              <MyRequestsPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                isAdmin
              />
            </AdminRoute>
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/admin/requests/:id">
            <AdminRoute>
              <RequestDetailPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                isAdmin
              />
            </AdminRoute>
          </AuthenticatedRoute>
          <Route component={PageNotFound} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
