import React, { useState, useEffect } from 'react';
import { RegistrationForm } from '../features/auth/RegistrationForm';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useBoard } from '../store';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';

export const RegisterPage: React.FC = () => {
    const { authenticatedUser, isAuthReady } = useBoard();
    const navigate = useNavigate();
    const [authSuccess, setAuthSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthReady && authenticatedUser) {
            navigate('/');
        }
    }, [authenticatedUser, isAuthReady, navigate]);

    if (!isAuthReady) {
        return <LoadingOverlay />;
    }

    return (
        <div className="max-w-md mx-auto my-12 cosmic-glass cosmic-glow-border border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-[0_0_80px_rgba(34,211,238,0.1)] relative overflow-hidden" id="register-outer-card">
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 blur-3xl -ml-16 -mb-16 pointer-events-none" />

            <div className="text-center space-y-4 relative z-10">
                <div className="p-5 bg-gradient-to-tr from-teal-400/20 to-purple-500/20 border border-white/10 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto text-teal-350 shadow-xl">
                    <Plus className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase italic">Sign Up</h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto">
                        Setup Daily Responsibilities & Points 🏡
                    </p>
                </div>
            </div>

            <div className="relative z-10">
                {authSuccess ? (
                   <div className="p-5 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-bold leading-relaxed animate-fade-in text-center flex flex-col items-center gap-4">
                      <span className="text-2xl">✨</span>
                      {authSuccess}
                      <Link to="/login" className="btn-nebula text-[10px] uppercase tracking-widest px-8">Visit Board Access Portal</Link>
                   </div>
                ) : (
                   <RegistrationForm onSuccess={setAuthSuccess} />
                )}
            </div>
        </div>
    );
};
