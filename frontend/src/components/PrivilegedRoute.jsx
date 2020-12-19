/* eslint-disable react/jsx-props-no-spreading */
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isPrivileged } from '../api/loginApi';

export default function PrivilegedRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={() => (isPrivileged() ? children : <Redirect to="/" />)}
    />
  );
}

PrivilegedRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
