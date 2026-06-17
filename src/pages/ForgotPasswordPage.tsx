import React, { useState, useEffect } from 'react';
import { useBoard } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset, authenticatedUser, isAuthReady } = useBoard();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady && authenticatedUser) {
      navigate('/');
    }
  }, [authenticatedUser, isAuthReady, navigate]);

  if (!isAuthReady) {
    return <LoadingOverlay />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await sendPasswordReset(email.trim());
      setMessage("A password recovery link has been sent to your email address.");
    } catch (err: any) {
      setError("We couldn't find an account associated with that email address or the recovery request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
           <Link to="/login" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition text-xs uppercase tracking-widest font-black mb-8 group">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
           </Link>
           <h1 className="text-4xl font-black tracking-tighter mb-3 uppercase italic">Forgot Password</h1>
           <p className="text-white/40 text-sm font-medium">Enter your credentials to receive a secure access reset link.</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-500 opacity-50" />
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-bold leading-relaxed mb-6 animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {message ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-emerald-300 font-bold mb-8 leading-relaxed">
                {message}
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="w-full btn-nebula flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                   <input
                     type="email"
                     required
                     placeholder="email@domain.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-slate-900 border border-white/10 p-4 pl-12 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/10"
                   />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full btn-nebula flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                  <>
                    Send Reset Link <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-10 text-[10px] uppercase font-black tracking-widest text-white/10">
          Secure End-to-End Encryption Enabled
        </p>
      </motion.div>
    </div>
  );
};
