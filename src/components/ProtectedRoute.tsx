import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@shared/types';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.role);
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  if (userRole && !allowedRoles.includes(userRole)) {
    // Redirect to the other dashboard if role doesn't match
    const redirectPath = userRole === 'client' ? '/dashboard/client' : '/dashboard/cleaner';
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
}