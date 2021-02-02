import { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import dialogOptions from './helpers/sentryHelper';
import { checkRefreshTokenValid } from './api/loginApi';

import AuthenticatedRoute from './components/AuthenticatedRoute';
import PrivilegedRoute from './components/PrivilegedRoute';

import ErrorPage from './views/ErrorPage/ErrorPage';
import LandingPage from './views/LandingPage/LandingPage';
import LoginPage from './views/LoginPage/LoginPage';
import RequestCreatorPage from './views/RequestCreatorPage/RequestCreatorPage';
import MyRequestsPage from './views/MyRequestsPage/MyRequestsPage';
import RequestDetailPage from './views/RequestDetailPage/RequestDetailPage';
import PrivacyPolicyPage from './views/PrivacyPolicyPage/PrivacyPolicyPage';
import TermsOfServicePage from './views/TermsOfServicePage/TermsOfServicePage';

import 'assets/scss/material-kit-react.scss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token') && checkRefreshTokenValid()
  );
  return (
    <Router>
      <Sentry.ErrorBoundary
        fallback={() => <ErrorPage type="internal" />}
        showDialog
        dialogOptions={dialogOptions}
      >
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
            <PrivilegedRoute>
              <MyRequestsPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                isPrivileged
              />
            </PrivilegedRoute>
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/admin/requests/:id">
            <PrivilegedRoute>
              <RequestDetailPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                isPrivileged
              />
            </PrivilegedRoute>
          </AuthenticatedRoute>
          <Route exact path="/privacy">
            <PrivacyPolicyPage
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </Route>
          <Route exact path="/terms">
            <TermsOfServicePage
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          </Route>
          <Route render={() => <ErrorPage type="notfound" />} />
        </Switch>
      </Sentry.ErrorBoundary>
    </Router>
  );
}

export default App;
