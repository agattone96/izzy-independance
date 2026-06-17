import React, { useState } from 'react';
import { useBoard } from '../../store';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { loginWithEmail, loginWithGoogle, sendMagicLink } = useBoard();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await loginWithEmail(email.trim(), password);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your email & password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await loginWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Google Sign-in not successful. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setMagicLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendMagicLink(email.trim());
      setMessage("A magic link has been sent to your email. Check your inbox!");
    } catch (err: any) {
      setError(err?.message || "Magic link request not successful.");
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div className="w-full" id="login-form-container">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-bold leading-relaxed mb-6 animate-fade-in" id="login-error-banner">
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold leading-relaxed mb-6 animate-fade-in" id="login-success-banner">
          ✨ {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="operator@matrix.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/10"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-[9px] uppercase font-bold tracking-widest text-cyan-400/50 hover:text-cyan-400 transition"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/10"
            />
          </div>
          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full btn-nebula flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                <>
                  Sign In <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="bg-white text-slate-950 font-black p-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Google
              </button>
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={magicLoading}
                className="bg-white/5 text-white font-black p-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {magicLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Magic Link"}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6 flex flex-col gap-3">
             <Link 
               to="/register"
               className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition cursor-pointer"
             >
               Need a new board? Sign Up
             </Link>
             <button 
               type="button"
               onClick={() => alert("Contact your board administrator for recovery protocols.")}
               className="text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-white/20 transition cursor-pointer"
             >
               Recovery Protocols
             </button>
          </div>
        </form>
    </div>
  );
};
