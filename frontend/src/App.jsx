import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import dialogOptions from 'helpers/sentryHelper';
import { checkRefreshTokenValid } from 'api/loginApi';

import AuthenticatedRoute from 'components/AuthenticatedRoute';
import PrivilegedRoute from 'components/PrivilegedRoute';
import ScrollToTop from 'components/ScrollToTop';

import ErrorPage from 'views/ErrorPage/ErrorPage';
import LandingPage from 'views/LandingPage/LandingPage';
import LoginPage from 'views/LoginPage/LoginPage';
import ProfilePage from 'views/ProfilePage/ProfilePage';
import RequestCreatorPage from 'views/RequestCreatorPage/RequestCreatorPage';
import MyRequestsPage from 'views/MyRequestsPage/MyRequestsPage';
import RedirectPage from 'views/RedirectPage/RedirectPage';
import RequestDetailPage from 'views/RequestDetailPage/RequestDetailPage';
import PrivacyPolicyPage from 'views/PrivacyPolicyPage/PrivacyPolicyPage';
import TermsOfServicePage from 'views/TermsOfServicePage/TermsOfServicePage';

import 'assets/scss/material-kit-react.scss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token') && checkRefreshTokenValid(),
  );
  return (
    <Router>
      <ScrollToTop />
      <Sentry.ErrorBoundary
        fallback={() => <ErrorPage type="internal" />}
        showDialog
        dialogOptions={dialogOptions}
      >
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <AuthenticatedRoute>
                <ProfilePage
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/new-request"
            element={
              <RequestCreatorPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
          <Route
            path="/my-requests"
            element={
              <AuthenticatedRoute>
                <MyRequestsPage
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/my-requests/:id"
            element={
              <AuthenticatedRoute>
                <RequestDetailPage
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <AuthenticatedRoute>
                <PrivilegedRoute>
                  <MyRequestsPage
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                    isPrivileged
                  />
                </PrivilegedRoute>
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/admin/requests/:id"
            element={
              <AuthenticatedRoute>
                <PrivilegedRoute>
                  <RequestDetailPage
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                    isPrivileged
                  />
                </PrivilegedRoute>
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <AuthenticatedRoute>
                <PrivilegedRoute>
                  <ProfilePage
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                </PrivilegedRoute>
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <PrivacyPolicyPage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
          <Route
            path="/terms"
            element={
              <TermsOfServicePage
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
          <Route path="/redirect" element={<RedirectPage />} />
          <Route path="*" element={<ErrorPage type="notfound" />} />
        </Routes>
      </Sentry.ErrorBoundary>
    </Router>
  );
}

export default App;
