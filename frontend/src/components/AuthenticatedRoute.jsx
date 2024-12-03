import { Navigate, useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { isAuthenticated } from 'src/helpers/authenticationHelper';

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
