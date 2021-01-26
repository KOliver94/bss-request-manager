import { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { checkRefreshTokenValid } from './api/loginApi';

import AuthenticatedRoute from './components/AuthenticatedRoute';
import PrivilegedRoute from './components/PrivilegedRoute';

import PageNotFound from './views/PageNotFound/PageNotFound';
import LandingPage from './views/LandingPage/LandingPage';
import LoginPage from './views/LoginPage/LoginPage';
import RequestCreatorPage from './views/RequestCreatorPage/RequestCreatorPage';
import MyRequestsPage from './views/MyRequestsPage/MyRequestsPage';
import RequestDetailPage from './views/RequestDetailPage/RequestDetailPage';

import 'assets/scss/material-kit-react.scss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token') && checkRefreshTokenValid()
  );
  return (
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
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
}

export default App;
