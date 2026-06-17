import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smile, LogOut, ShieldCheck, X } from 'lucide-react';
import { useBoard } from '../store';
import { User } from '../types/domain.types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { 
    authenticatedUser,
    currentUser, 
    users, 
    family,
    switchProfile, 
    logout 
  } = useBoard();

  const navigate = useNavigate();
  const location = useLocation();

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinTargetUser, setPinTargetUser] = useState<User | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleProfileSwitchRequest = (user: User) => {
    if (user.id === currentUser?.id) return;

    // If the authenticated account is a child account, they can't switch at all
    if (authenticatedUser?.role === 'child') {
      alert("This account is restricted to the child dashboard. Parents use the switcher.");
      return;
    }

    if (user.role === 'parent' && user.pin) {
      setPinTargetUser(user);
      setPinInput('');
      setPinError(false);
      setPinModalOpen(true);
    } else {
      performSwitch(user);
    }
  };

  const performSwitch = (user: User) => {
    switchProfile(user.id);
    if (user.role === 'parent') {
      navigate('/parent');
    } else if (user.role === 'caregiver') {
      navigate('/caregiver');
    } else {
      navigate('/child');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinTargetUser && pinInput === pinTargetUser.pin) {
      performSwitch(pinTargetUser);
      setPinModalOpen(false);
      setPinTargetUser(null);
      setPinInput('');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  useEffect(() => {
    if (pinInput.length === 4 && pinTargetUser?.pin?.length === 4) {
      if (pinInput === pinTargetUser.pin) {
        performSwitch(pinTargetUser);
        setPinModalOpen(false);
        setPinTargetUser(null);
        setPinInput('');
      } else {
        setPinError(true);
        setTimeout(() => setPinError(false), 2000);
      }
    }
  }, [pinInput]);

  return (
    <div className="min-h-screen bg-cosmic-bg text-slate-200 font-sans flex flex-col justify-between relative overflow-hidden" id="applet-body-container">
      {/* Dynamic Nebula Effect */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 blur-[100px] rounded-full"></div>
      </div>
      
      <header className="bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50 shadow-2xl relative" id="global-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer relative z-10 group" onClick={() => navigate('/')} id="header-brand-box">
              <div className="p-2.5 bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-white/20 transition-transform group-hover:scale-110">
                <Smile className="w-6 h-6" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-sm font-black text-white tracking-widest uppercase leading-none block font-display">
                  Independence Board
                </h1>
                <span className="text-[10px] text-cyan-400 font-bold block mt-1 tracking-widest uppercase opacity-80 font-black">
                  Responsibility Grows Freedom
                </span>
              </div>
            </div>

            {authenticatedUser && (
              <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] shrink-0 relative z-10" id="header-center-links">
                <button
                  onClick={() => navigate('/')}
                  className={`py-2 px-6 rounded-full transition-all border ${location.pathname === '/' || location.pathname.includes('/parent') || location.pathname.includes('/child') || location.pathname.includes('/caregiver') ? 'bg-white/10 text-white border-white/10 shadow-lg' : 'text-white/40 border-transparent hover:text-white hover:bg-white/5 cursor-pointer'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/agree-rules')}
                  className={`py-2 px-6 rounded-full transition-all border ${location.pathname === '/agree-rules' ? 'bg-white/10 text-white border-white/10 shadow-lg' : 'text-white/40 border-transparent hover:text-white hover:bg-white/5 cursor-pointer'}`}
                >
                  Family Rules
                </button>
              </div>
            )}

            {!authenticatedUser && location.pathname !== '/' && (
              <button 
                onClick={() => navigate('/')}
                className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer relative z-10"
              >
                ← Return to Home Portal
              </button>
            )}

            <div className="flex items-center gap-4 relative z-10" id="profile-controls-tray">
              {authenticatedUser ? (
                <div className="flex items-center gap-4" id="authenticated-member-badge">
                  {authenticatedUser.role === 'parent' && users.length > 0 && (
                     <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-xl" id="profile-dropdown-widget">
                       {users.map((u) => (
                         <button
                           key={u.id}
                           onClick={() => handleProfileSwitchRequest(u)}
                           className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 transition-all active:scale-95 ${currentUser?.id === u.id ? 'bg-white/15 text-white border border-white/10 shadow-xl' : 'text-white/30 border border-transparent hover:text-white/60 hover:bg-white/5'}`}
                           title={`Switch to ${u.name}`}
                         >
                           <span className="text-base shrink-0">{u.avatar}</span>
                           <span className="max-w-[60px] truncate hidden sm:inline">{u.name.split(' ')[0]}</span>
                         </button>
                       ))}
                     </div>
                  )}

                  <button 
                    onClick={logout}
                    className="p-3 bg-red-500/5 text-red-400 rounded-2xl hover:bg-red-500/10 border border-red-500/10 transition-all active:scale-90 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
                    title="Sign Out"
                    id="signout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" id="applet-main-body">
        {children}
      </main>

      {/* PIN Verification Modal for Switching to Parent */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/15 p-8 rounded-3xl shadow-2xl w-full max-w-sm space-y-6 animate-scale-in text-center">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-teal-500/10 text-teal-300 border border-teal-500/20 rounded-2xl mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <button onClick={() => setPinModalOpen(false)} className="text-white/30 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Parental Gate</h3>
              <p className="text-white/50 text-xs font-medium leading-relaxed">
                Enter the 4-digit PIN for **{pinTargetUser?.name}** to verify authorization and switch dashboards.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="flex justify-center gap-3">
                <input
                  autoFocus
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className={`w-40 bg-white/5 border ${pinError ? 'border-rose-500 animate-shake' : 'border-white/10'} p-4 rounded-2xl text-center text-3xl font-black tracking-[1em] text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono`}
                  placeholder="****"
                />
              </div>

              {pinError && (
                <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                  Incorrect PIN. Please try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-teal-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition active:scale-95 text-xs uppercase tracking-widest"
              >
                Verify & Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-white/5 border-t border-white/10 py-6 relative z-10" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-white/30 font-medium space-y-1">
          <p>Izzy’s Independence Board — Guided Chore & Trust Optimization Engine © 2026.</p>
        </div>
      </footer>
    </div>
  );
};
