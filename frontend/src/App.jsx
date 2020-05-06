import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import AuthenticatedRoute from './components/AuthenticatedRoute';
import AdminRoute from './components/AdminRoute';

import PageNotFound from './views/PageNotFound/PageNotFound';
import LandingPage from './views/LandingPage/LandingPage';
import LoginPage from './views/LoginPage/LoginPage';
import RequestCreatorPage from './views/RequestCreatorPage/RequestCreatorPage';
import MyRequestsPage from './views/MyRequestsPage/MyRequestsPage';
import RequestDetailPage from './views/RequestDetailPage/RequestDetailPage';

import 'assets/scss/material-kit-react.scss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
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
  );
}

export default App;
