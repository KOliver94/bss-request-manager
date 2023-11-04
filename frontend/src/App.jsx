import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import dialogOptions from 'src/helpers/sentryHelper';
import { checkRefreshTokenValid } from 'src/api/loginApi';

import AuthenticatedRoute from 'src/components/AuthenticatedRoute';
import ScrollToTop from 'src/components/ScrollToTop';

import ErrorPage from 'src/views/ErrorPage/ErrorPage';
import LandingPage from 'src/views/LandingPage/LandingPage';
import LoginPage from 'src/views/LoginPage/LoginPage';
import ProfilePage from 'src/views/ProfilePage/ProfilePage';
import RequestCreatorPage from 'src/views/RequestCreatorPage/RequestCreatorPage';
import MyRequestsPage from 'src/views/MyRequestsPage/MyRequestsPage';
import RedirectPage from 'src/views/RedirectPage/RedirectPage';
import RequestDetailPage from 'src/views/RequestDetailPage/RequestDetailPage';
import PrivacyPolicyPage from 'src/views/PolicyPages/PrivacyPolicyPage';
import TermsOfServicePage from 'src/views/PolicyPages/TermsOfServicePage';

import 'src/assets/scss/material-kit-react.scss';

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
