/* eslint-disable react/jsx-props-no-spreading */
import { Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated } from '../api/loginApi';

export default function AuthenticatedRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated() ? (
          children
        ) : (
          <Navigate
            to={{
              pathname: '/login',
              state: { from: location },
            }}
            replace
          />
        )
      }
    />
  );
}

AuthenticatedRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
