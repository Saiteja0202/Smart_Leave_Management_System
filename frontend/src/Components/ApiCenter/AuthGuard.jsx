import { Navigate } from 'react-router-dom';
import { isLoggedIn } from './AuthUtils';

const AuthGuard = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthGuard;