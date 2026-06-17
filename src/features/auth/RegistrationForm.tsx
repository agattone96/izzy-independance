import React, { useState } from 'react';
import { useBoard } from '../../store';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegistrationFormProps {
  onSuccess?: (message: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const { registerNewFamily, loginWithGoogle } = useBoard();
  const [parentName, setParentName] = useState('');
  const [familyNameInput, setFamilyNameInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time' },
    { value: 'America/Anchorage', label: 'Alaska Time' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
    { value: 'Europe/London', label: 'London / GMT' },
    { value: 'Europe/Paris', label: 'Paris / CET' },
    { value: 'Australia/Sydney', label: 'Sydney / AEST' },
    { value: 'Asia/Tokyo', label: 'Tokyo / JST' },
    { value: 'UTC', label: 'UTC / Universal' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !parentName || !familyNameInput || !timezone) return;
    setLoading(true);
    setError(null);
    try {
      await registerNewFamily(parentName.trim(), email.trim(), password, familyNameInput.trim(), timezone);
      onSuccess?.("Family board created! You are now the administrator.");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full" id="registration-form-container">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-bold leading-relaxed mb-6 animate-fade-in" id="register-error-banner">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" id="register-family-form">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Parent Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Allison"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Family Board Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Izzy's Independence Board"
              value={familyNameInput}
              onChange={(e) => setFamilyNameInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Matrix Timezone</label>
            <div className="relative">
              <select
                required
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value} className="bg-slate-900 text-white">
                    {tz.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                ▼
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Password</label>
            <input
              type="password"
              required
              placeholder="At least 6 characters..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
            />
          </div>
          
          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-nebula flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                <>
                  Sign Up <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await loginWithGoogle();
                  onSuccess?.("Logged in via Google! Directing to set up your family board...");
                } catch (err: any) {
                  setError(err?.message || "Google sign-up failed.");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full bg-white text-slate-950 font-black p-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              Sign up with Google
            </button>
          </div>
          <div className="text-center mt-6">
             <Link 
               to="/login"
               className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition cursor-pointer"
             >
               Already have a board? Sign In
             </Link>
          </div>
        </form>
    </div>
  );
};
