import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBoard } from '../store';
import { Smile } from 'lucide-react';
import { RoleMismatchOverlay } from '../components/feedback/RoleMismatchOverlay';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';

interface RoleGuardProps {
  allowedRoles: ('parent' | 'child' | 'caregiver')[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { authenticatedUser, currentUser, isAuthReady } = useBoard();
  const location = useLocation();

  if (!isAuthReady) {
    return <LoadingOverlay />;
  }

  if (!authenticatedUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (currentUser && !allowedRoles.includes(currentUser.role)) {
    return <RoleMismatchOverlay requiredRole={allowedRoles[0]} />;
  }

  return <>{children}</>;
};
