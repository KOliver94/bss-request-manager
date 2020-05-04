import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import PageNotFound from './views/PageNotFound/PageNotFound';
import LandingPage from './views/LandingPage/LandingPage';
import LoginPage from './views/LoginPage/LoginPage';
import RequestCreatorPage from './views/RequestCreatorPage/RequestCreatorPage';

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
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
}

export default App;
