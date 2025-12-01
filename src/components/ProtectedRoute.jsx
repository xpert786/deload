import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
  
  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    // Redirect based on user role to their appropriate dashboard
    if (userRole === 'client') {
      return <Navigate to="/client/dashboard" replace />;
    } else if (userRole === 'coach') {
      return <Navigate to="/coach/dashboard" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // If role doesn't match and user is authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

