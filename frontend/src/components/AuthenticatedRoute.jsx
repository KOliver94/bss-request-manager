import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated } from 'api/loginApi';

export default function AuthenticatedRoute({ children }) {
  const location = useLocation();
  return isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

AuthenticatedRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
