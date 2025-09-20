import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactElement;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/'} ) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  return children;
};

interface RoleGuardProps {
  roles: string[]; // required roles any-of
  children: React.ReactElement;
  fallback?: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children, fallback }) => {
  const { roles: userRoles } = useAuth();
  const hasRole = roles.length === 0 || roles.some(r => userRoles.includes(r));
  if (!hasRole) return fallback || <div>Not authorized.</div>;
  return children;
};
