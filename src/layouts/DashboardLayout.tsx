import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smile, LogOut, ShieldCheck, X, Settings, ChevronDown } from 'lucide-react';
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
    logout,
    leaveFamilyBoard
  } = useBoard();

  const navigate = useNavigate();
  const location = useLocation();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinTargetUser, setPinTargetUser] = useState<User | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveErrorMsg, setLeaveErrorMsg] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);

  const handleLeaveConfirm = async () => {
    setLeaveLoading(true);
    setLeaveErrorMsg('');
    try {
      await leaveFamilyBoard();
      setLeaveModalOpen(false);
    } catch (err: any) {
      setLeaveErrorMsg(err?.message || "An error occurred while leaving.");
    } finally {
      setLeaveLoading(false);
    }
  };

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
                  Izzy’s Independence Board
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

            <div className="flex items-center gap-4 relative z-10 font-sans" id="profile-controls-tray">
              {authenticatedUser ? (
                <div className="flex items-center gap-2" id="family-profile-header-root">
                  {/* Settings Gear (Parent Only) */}
                  {currentUser?.role === 'parent' && (
                    <button
                      onClick={() => navigate('/parent?tab=settings')}
                      className={`p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition duration-150 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer`}
                      title="Settings & System Configurations"
                      id="header-settings-gear"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}

                  {/* Profile Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl transition-all duration-150 active:scale-95 cursor-pointer"
                      id="profile-dropdown-trigger"
                    >
                      <span className="text-xl leading-none">{currentUser?.avatar || '👤'}</span>
                      <span className="text-xs font-black text-white uppercase tracking-wider">{currentUser?.name || 'User'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-white/55 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setProfileMenuOpen(false)} />
                        
                        <div className="absolute right-0 mt-2.5 w-64 bg-slate-950/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl py-3 z-50 animate-fade-in space-y-1 block" id="header-profile-dropdown-content">
                          <div className="px-4 py-1.5 border-b border-white/5 mb-2">
                            <span className="text-[9px] font-bold uppercase text-indigo-400 tracking-widest block">Active Profile</span>
                            <p className="text-xs font-extrabold text-white mt-0.5 truncate">{currentUser?.name}</p>
                            <span className="text-[9px] uppercase font-bold text-white/40 block mt-0.5">{currentUser?.role} account</span>
                          </div>

                          {authenticatedUser.role === 'parent' && users.length > 0 && (
                            <div className="px-3 py-1 space-y-1">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/30 px-1.5 block">Switch Family Profile</span>
                              {users.map((u) => (
                                <button
                                  key={u.id}
                                  onClick={() => {
                                    handleProfileSwitchRequest(u);
                                    setProfileMenuOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold uppercase tracking-tight flex items-center gap-2 transition duration-150 ${currentUser?.id === u.id ? 'bg-white/15 text-white border border-white/10' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`}
                                >
                                  <span className="text-base shrink-0">{u.avatar}</span>
                                  <span className="truncate">{u.name}</span>
                                  {currentUser?.id === u.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="border-t border-white/5 my-2 pt-2 px-3 space-y-1">
                            {currentUser?.role === 'parent' && (
                              <button
                                onClick={() => {
                                  navigate('/parent?tab=settings');
                                  setProfileMenuOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left rounded-xl text-xs font-bold uppercase text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2 transition"
                              >
                                <Settings className="w-3.5 h-3.5 text-white/45" />
                                <span>Settings Entry</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                logout();
                                setProfileMenuOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left rounded-xl text-xs font-black uppercase text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 flex items-center gap-2 transition"
                              id="dropdown-signout-btn"
                            >
                              <LogOut className="w-3.5 h-3.5 text-rose-500" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" id="applet-main-body">
        {children}
      </main>

      {/* Leave Family Confirmation Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/15 p-8 rounded-3xl shadow-2xl w-full max-w-sm space-y-6 animate-scale-in text-center">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-2xl mx-auto">
                <LogOut className="w-8 h-8 rotate-180 text-rose-400" />
              </div>
              <button onClick={() => setLeaveModalOpen(false)} className="text-white/30 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Leave Family Board</h3>
              <p className="text-white/50 text-xs font-medium leading-relaxed">
                Are you sure you want to leave **{family?.name}**?
              </p>
              <p className="text-white/30 text-[10px] italic leading-relaxed">
                Clear routines. Earned rewards. Calmer family follow-through.
              </p>
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-2">
                This will sever this account's access. Daily chores and history are untouched but your profile will lose permissions.
              </p>
            </div>

            {leaveErrorMsg && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/25 rounded-2xl text-rose-300 text-[10px] font-bold leading-normal">
                ⚠️ {leaveErrorMsg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="w-1/2 bg-white/5 text-white/70 hover:bg-white/10 font-black py-4 rounded-2xl hover:text-white transition active:scale-95 text-xs uppercase tracking-widest border border-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveConfirm}
                disabled={leaveLoading}
                className="w-1/2 bg-rose-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-400 transition active:scale-95 text-xs uppercase tracking-widest"
              >
                {leaveLoading ? "Leaving..." : "Leave Board"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <p>Izzy’s Independence Board — Clear routines. Earned rewards. Calmer family follow-through. © 2026.</p>
        </div>
      </footer>
    </div>
  );
};
