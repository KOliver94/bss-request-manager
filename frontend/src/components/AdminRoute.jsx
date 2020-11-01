/* eslint-disable react/jsx-props-no-spreading */
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAdminOrStaff } from '../api/loginApi';

export default function AdminRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={() => (isAdminOrStaff() ? children : <Redirect to="/" />)}
    />
  );
}

AdminRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
