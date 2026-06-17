import React, { useState, useEffect } from 'react';
import { useBoard } from '../../store';
import { RefreshCw, Sparkles } from 'lucide-react';

interface InviteFormProps {
  initialInviteCode?: string;
  onSuccess?: (message: string) => void;
}

export const InviteForm: React.FC<InviteFormProps> = ({ initialInviteCode = '', onSuccess }) => {
  const { claimInviteWithAccount, getInviteInfo } = useBoard();
  const [inviteCodeInput, setInviteCodeInput] = useState(initialInviteCode);
  const [inviteInfo, setInviteInfo] = useState<{name: string, role: string, familyName: string} | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialInviteCode) {
      setInviteCodeInput(initialInviteCode);
      validateToken(initialInviteCode);
    }
  }, [initialInviteCode]);

  const validateToken = async (code: string) => {
    if (code.length < 6) { setInviteInfo(null); return; }
    setIsValidating(true);
    try {
        const info = await getInviteInfo(code);
        setInviteInfo(info);
        if (info && !name) setName(info.name); // Pre-fill name if info found and field empty
        setError(info ? null : "Token not found or already used.");
    } finally {
        setIsValidating(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput || !name || !email || !password || !inviteInfo) return;
    setLoading(true);
    setError(null);
    try {
      await claimInviteWithAccount(inviteCodeInput.trim().toUpperCase(), email.trim(), password, name.trim());
      onSuccess?.("Successfully joined family group! Welcome home.");
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full" id="invite-form-container">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-bold leading-relaxed mb-6 animate-fade-in" id="invite-error-banner">
          ⚠️ {error}
        </div>
      )}
      
      {inviteInfo && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-6 animate-fade-in">
          Joining <strong>{inviteInfo.familyName}</strong> as <strong>{inviteInfo.role}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" id="join-invite-form">
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Invitation Code</label>
          <input
            type="text"
            required
            placeholder="6-digit code..."
            value={inviteCodeInput}
            onChange={(e) => { 
                setInviteCodeInput(e.target.value.toUpperCase());
                validateToken(e.target.value.toUpperCase());
            }}
            className={`w-full bg-white/5 border p-4 rounded-2xl text-sm text-white font-mono tracking-widest focus:outline-none focus:ring-2 transition-all ${inviteInfo ? 'border-emerald-500/50 focus:ring-emerald-500/30' : error ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/10 focus:ring-cyan-500/50'}`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="Your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
          />
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-nebula flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
              <>
                Join Board <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
