import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBoard } from '../store';
import { RoleGuard } from './RoleRouter';
import { ParentDashboard } from '../features/dashboard/ParentDashboard';
import { ChildDashboard } from '../features/dashboard/ChildDashboard';
import { CaregiverDashboard } from '../features/dashboard/CaregiverDashboard';
import { BoundariesScreen } from '../features/boundaries/BoundariesScreen';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { JoinPage } from '../pages/JoinPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { Smile } from 'lucide-react';

import { LoadingOverlay } from '../components/feedback/LoadingOverlay';
import { DashboardLayout } from '../layouts/DashboardLayout';

const HomeDashboardRedirect = () => {
  const { authenticatedUser, isAuthReady } = useBoard();

  if (!isAuthReady) {
    return <LoadingOverlay />;
  }

  if (!authenticatedUser) {
    return <LandingPage />;
  }

  if (authenticatedUser.role === 'parent') {
    return <Navigate to="/parent" replace />;
  } else if (authenticatedUser.role === 'child') {
    return <Navigate to="/child" replace />;
  } else if (authenticatedUser.role === 'caregiver') {
    return <Navigate to="/caregiver" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboardRedirect />} />
      <Route path="/agree-rules" element={
        <DashboardLayout>
          <BoundariesScreen />
        </DashboardLayout>
      } />
      <Route path="/login" element={
        <DashboardLayout>
          <LoginPage />
        </DashboardLayout>
      } />
      <Route path="/register" element={
        <DashboardLayout>
          <RegisterPage />
        </DashboardLayout>
      } />
      <Route path="/forgot-password" element={
        <DashboardLayout>
          <ForgotPasswordPage />
        </DashboardLayout>
      } />
      <Route path="/join/:token" element={
        <DashboardLayout>
          <JoinPage />
        </DashboardLayout>
      } />
      
      <Route path="/parent/*" element={
        <RoleGuard allowedRoles={['parent']}>
          <DashboardLayout>
            <ParentDashboard />
          </DashboardLayout>
        </RoleGuard>
      } />
      <Route path="/child/*" element={
        <RoleGuard allowedRoles={['child']}>
          <DashboardLayout>
            <ChildDashboard />
          </DashboardLayout>
        </RoleGuard>
      } />
      <Route path="/caregiver/*" element={
        <RoleGuard allowedRoles={['caregiver']}>
          <DashboardLayout>
            <CaregiverDashboard />
          </DashboardLayout>
        </RoleGuard>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
