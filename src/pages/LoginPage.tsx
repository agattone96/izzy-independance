import React, { useState, useEffect } from 'react';
import { LoginForm } from '../features/auth/LoginForm';
import { RegistrationForm } from '../features/auth/RegistrationForm';
import { InviteForm } from '../features/invites/InviteForm';
import { Unlock, Plus } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../store';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';

export const LoginPage: React.FC = () => {
  const { authenticatedUser, isAuthReady } = useBoard();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const urlInviteCode = searchParams.get('invite') || searchParams.get('ref') || '';

  useEffect(() => {
    if (isAuthReady && authenticatedUser) {
      navigate('/');
    }
  }, [authenticatedUser, isAuthReady, navigate]);

  if (!isAuthReady) {
    return <LoadingOverlay />;
  }
  
  return (
    <div className="max-w-md mx-auto my-12 cosmic-glass cosmic-glow-border rounded-[3rem] p-10 space-y-8 shadow-[0_0_80px_rgba(34,211,238,0.1)] relative overflow-hidden" id="login-container">
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl -ml-16 -mb-16 pointer-events-none" />

      <div className="text-center space-y-4 relative z-10">
        <div className="p-5 bg-gradient-to-tr from-cyan-400/20 to-indigo-500/20 border border-white/10 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto text-cyan-400 shadow-xl">
          {tab === 'invite' ? <Plus className="w-10 h-10" /> : <Unlock className="w-10 h-10" />}
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-widest uppercase italic">
            {tab === 'invite' ? 'Join Family' : tab === 'register' ? 'Sign Up' : 'Sign In'}
          </h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto">
            {tab === 'invite' ? 'Enter Invitation Details' : 'Independence Board Access Protocol'}
          </p>
        </div>
      </div>

      <div className="relative z-10">
        {tab === 'invite' ? (
          <InviteForm initialInviteCode={urlInviteCode} />
        ) : tab === 'register' ? (
          <RegistrationForm />
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};
