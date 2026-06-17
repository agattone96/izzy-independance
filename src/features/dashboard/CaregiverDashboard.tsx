import React, { useState } from 'react';
import { useBoard } from '../../store';
import { 
  Heart, 
  Clock, 
  PhoneCall, 
  Baby, 
  MapPin, 
  CheckCircle, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Sparkles,
  Lock,
  Moon,
  ClipboardList,
  RefreshCw
} from 'lucide-react';

export const CaregiverDashboard: React.FC = () => {
  const { 
    family, 
    users, 
    tasks, 
    completions,
    toggleVisitMode, 
    completeTaskByChild,
    authenticatedUser,
    logout
  } = useBoard();

  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [checklistSelections, setChecklistSelections] = useState<{ [key: number]: boolean }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter children
  const children = users.filter(u => u.role === 'child');
  
  // Filter visit-specific tasks, and other active tasks
  const visitTasks = tasks.filter(t => t.active && t.isVisitTask);
  const regularTasks = tasks.filter(t => t.active && !t.isVisitTask);

  // Set default child if empty
  if (!selectedChildId && children.length > 0) {
    setSelectedChildId(children[0].id);
  }

  // Set default task if empty
  if (!selectedTaskId && visitTasks.length > 0) {
    setSelectedTaskId(visitTasks[0].id);
  } else if (!selectedTaskId && regularTasks.length > 0) {
    setSelectedTaskId(regularTasks[0].id);
  }

  const activeTask = tasks.find(t => t.id === selectedTaskId);

  // Handle task complete logs
  const handleLogCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !selectedTaskId) {
      setErrorMessage("Please verify child and task are selected.");
      return;
    }

    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await completeTaskByChild(selectedTaskId, selectedChildId, checklistSelections);
      setSuccessMessage(`Goal progress logged! Sent for parent review with status "Sent for review". Great work! ✨`);
      // Reset checklist
      setChecklistSelections({});
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to log task. Let's try once more.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedChild = children.find(c => c.id === selectedChildId);

  // Parent instructions (or fallbacks)
  const defaultInstructions = {
    allergies: "No known food allergies. Wholesome ingredients only.",
    bedtime: "8:30 PM (quiet wind-down reading 15 mins prior)",
    emergencyContacts: "911, Mom: (555) 019-2834, Dad: (555) 019-4567",
    customNotes: "Stickers in the drawer can be awarded for completed checklist items!"
  };

  const instructions = family?.parentInstructions || defaultInstructions;
  const isVisitActive = !!family?.isActiveVisit;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 text-white min-h-screen" id="caregiver-dashboard-root">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cosmic-glass cosmic-glow-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden" id="caregiver-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full backdrop-blur-md">
              Guardian Mode active 🧑‍⚕️
            </span>
            {isVisitActive && (
              <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full backdrop-blur-md animate-pulse">
                🏡 Visit Protocol Engaged
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-2 text-white">
            Caregiver <span className="text-amber-400">Terminal</span>
          </h1>
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
            Supportive supervision panel for {family?.name || "the Family Group"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8" id="caregiver-body">
        
        {/* Left Column: Directives & Quick Controls */}
        <div className="lg:col-span-1 space-y-6" id="caregiver-panel-left">
          
          {/* Visit Mode Toggle */}
          <div className="cosmic-glass cosmic-glow-border rounded-3xl p-7 space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
              <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-cyan-400">
                <MapPin className="w-4 h-4" /> Visit Sync
              </h3>
              <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{isVisitActive ? "Live" : "Standby"}</span>
            </div>
            <p className="text-white/40 text-[11px] font-medium leading-relaxed italic">
              When Visit Mode is engaged, specific weekly "At-Home" tasks are gently hidden to prioritize independence-first care.
            </p>
            <button
              onClick={toggleVisitMode}
              className={`w-full py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border transition-all active:scale-95 cursor-pointer shadow-lg ${
                isVisitActive 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20 shadow-rose-500/10" 
                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 shadow-cyan-500/10"
              }`}
            >
              {isVisitActive ? (
                <>
                  <ToggleRight className="w-6 h-6 text-rose-400" /> Disable Protocols
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-cyan-400" /> Engage Protocols
                </>
              )}
            </button>
          </div>

          {/* Parent Instructions Card */}
          <div className="cosmic-glass cosmic-glow-border rounded-3xl p-7 space-y-6 shadow-xl relative overflow-hidden">
            <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4 text-amber-300">
              <Heart className="w-4 h-4" /> Stewardship Guidelines
            </h3>
            
            <div className="space-y-6">
              {/* Bedtime */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" /> Curfew & Rest
                </span>
                <p className="bg-white/5 p-4 rounded-2xl border border-white/5 font-black text-xs text-white/80 leading-relaxed group hover:bg-white/10 transition-colors">
                  {instructions.bedtime || "8:30 PM"}
                </p>
              </div>

              {/* Allergies / Feed */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Bio-Safety Alert
                </span>
                <p className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20 font-black text-xs text-rose-200 leading-relaxed">
                  {instructions.allergies || "None declared."}
                </p>
              </div>

              {/* Emergency Numbers */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-cyan-400" /> Emergency Relay
                </span>
                <p className="bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/20 font-mono text-xs text-cyan-300 font-black tracking-wider">
                  {instructions.emergencyContacts || "911"}
                </p>
              </div>

              {/* Special instructions */}
              {instructions.customNotes && (
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Guardian Notes
                  </span>
                  <p className="bg-white/5 p-4 rounded-2xl border border-white/5 italic text-white/60 text-xs font-medium leading-relaxed">
                    "{instructions.customNotes}"
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Visit-Log Tasks Checklist & Submissions */}
        <div className="lg:col-span-2 space-y-6" id="caregiver-panel-right">
          
          <div className="cosmic-glass cosmic-glow-border rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden" id="caregiver-log-action-card">
            
            <div className="border-b border-white/5 pb-6 mb-4">
              <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3 text-white">
                <ClipboardList className="w-8 h-8 text-cyan-400" /> Milestone Verification
              </h3>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-2">
                Log chores or reading milestones completed during your guardianship.
              </p>
            </div>

            {successMessage && (
              <div className="p-5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] uppercase font-black tracking-widest rounded-2xl mb-8 flex items-center gap-4 animate-scale-in" id="caregiver-success">
                <div className="p-2 bg-cyan-500/20 rounded-full shrink-0">
                  <CheckCircle className="w-6 h-6" /> 
                </div>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] uppercase font-black tracking-widest rounded-2xl mb-8 flex items-center gap-4 animate-scale-in" id="caregiver-error">
                <div className="p-2 bg-rose-500/20 rounded-full shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                {errorMessage}
              </div>
            )}

            {children.length === 0 ? (
              <div className="p-12 text-center text-white/20 text-xs font-black uppercase tracking-widest border border-white/5 rounded-3xl bg-white/2">
                No child profiles detected in matrix.
              </div>
            ) : (
              <form onSubmit={handleLogCompletion} className="space-y-10">
                
                {/* 1. Select Child */}
                <div className="space-y-4">
                  <label className="block text-[10px] uppercase font-black tracking-[0.3em] text-white/20">
                    Target Profile
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {children.map(c => {
                      const active = c.id === selectedChildId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedChildId(c.id);
                            setSuccessMessage(null);
                          }}
                          className={`p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all active:scale-95 text-center cursor-pointer relative overflow-hidden group ${
                            active 
                              ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                              : "bg-white/5 border-white/10 hover:border-white/20 text-white/40"
                          }`}
                        >
                          <span className="text-4xl filter saturate-[0.8] group-hover:scale-110 transition-transform">{c.avatar || "👧"}</span>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase tracking-widest leading-none">{c.name}</p>
                            <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{active ? "Targeted" : "Standby"}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Select Chore / Visit Task */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="block text-[10px] uppercase font-black tracking-[0.3em] text-white/20">
                    Observation Protocol
                  </label>
                  <div className="space-y-6">
                    
                    {/* Highlighted Visit Tasks */}
                    {visitTasks.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[9px] uppercase font-black tracking-[0.3em] text-amber-400 bg-amber-500/10 px-4 py-1 rounded-full border border-amber-500/20">
                          Visit Protocols
                        </span>
                        <div className="grid md:grid-cols-2 gap-4">
                          {visitTasks.map(t => {
                            const isSelected = t.id === selectedTaskId;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTaskId(t.id);
                                  setChecklistSelections({});
                                }}
                                className={`p-5 rounded-2xl border flex items-start gap-4 transition-all active:scale-98 text-left relative overflow-hidden group ${
                                  isSelected 
                                    ? "bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.1)]" 
                                    : "bg-white/5 border-white/10 hover:border-white/20 text-white/50"
                                }`}
                              >
                                <span className="p-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black font-sans shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform">
                                  {t.pointValue}
                                </span>
                                <div>
                                  <h4 className="font-black text-xs uppercase tracking-widest leading-snug">{t.title}</h4>
                                  <p className="text-[10px] opacity-60 mt-1 font-medium leading-relaxed italic line-clamp-1">"{t.description}"</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Regular Tasks Category */}
                    <div className="space-y-3">
                      <span className="text-[9px] uppercase font-black tracking-[0.3em] text-white/20">
                        General Board Standards
                      </span>
                      <div className="grid md:grid-cols-2 gap-4">
                        {regularTasks.map(t => {
                          const isSelected = t.id === selectedTaskId;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSelectedTaskId(t.id);
                                setChecklistSelections({});
                              }}
                              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-98 text-left group ${
                                isSelected 
                                  ? "bg-cyan-500/15 border-cyan-500/40 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                                  : "bg-white/2 border-white/5 hover:border-white/15 text-white/30"
                              }`}
                            >
                              <span className="p-1 px-2.5 rounded-lg bg-white/5 text-white/40 text-[10px] font-black shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                                {t.pointValue} PT
                              </span>
                              <div>
                                <h4 className="font-black text-[11px] uppercase tracking-widest leading-none">{t.title}</h4>
                                <p className="text-[9px] opacity-30 mt-1 truncate max-w-[180px] font-bold">Category: {t.category}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. Checklist items (if active task has any) */}
                {activeTask && activeTask.checklistItems && activeTask.checklistItems.length > 0 && (
                  <div className="space-y-4 cosmic-glass rounded-3xl p-7 border border-cyan-500/20 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-30" />
                    <label className="block text-[10px] uppercase font-black tracking-[0.3em] text-cyan-400">
                      milestone verification details
                    </label>
                    <div className="space-y-3">
                      {activeTask.checklistItems.map((item, idx) => {
                        const checked = !!checklistSelections[idx];
                        return (
                          <label 
                            key={idx} 
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
                                checked ? "bg-cyan-500/10 border-cyan-500/30 text-white" : "bg-white/2 border-white/5 text-white/40 hover:bg-white/5"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                checked ? "bg-cyan-500 border-cyan-500 text-white" : "border-white/20 group-hover:border-white/40"
                            }`}>
                                {checked && <CheckCircle className="w-4 h-4" />}
                            </div>
                            <input 
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setChecklistSelections(prev => ({
                                  ...prev,
                                  [idx]: !prev[idx]
                                }));
                              }}
                              className="hidden"
                            />
                            <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${checked ? 'opacity-100' : 'opacity-40'}`}>
                              {item}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Confirm actions */}
                <div className="pt-8 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-nebula flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
                  >
                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                        <>
                            Log Matrix Accomplishment 🚀
                        </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
