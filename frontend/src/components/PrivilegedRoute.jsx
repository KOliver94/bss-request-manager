import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isPrivileged } from '../api/loginApi';

export default function PrivilegedRoute({ children }) {
  return isPrivileged() ? children : <Navigate to="/" replace />;
}

PrivilegedRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
