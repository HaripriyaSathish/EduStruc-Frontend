import { Navigate } from 'react-router-dom';
import { isLoggedIn, getSession } from '../utils/auth';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const role = getSession()?.role;
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
}