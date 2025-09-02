/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'superadmin';
  allowedRoles?: ('admin' | 'superadmin')[];
}

const ProtectedRoute = ({ children, requiredRole, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === 'superadmin') {
      return <Navigate to="/admin/restaurants" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  // Check if user has any of the allowed roles
  if (allowedRoles && !allowedRoles.includes(user?.role as 'admin' | 'superadmin')) {
    // Redirect based on user role
    if (user?.role === 'superadmin') {
      return <Navigate to="/admin/restaurants" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;