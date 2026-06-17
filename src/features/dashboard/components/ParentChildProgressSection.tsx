import React from 'react';
import { useBoard } from '../../../store';
import { useParentDashboardMetrics } from '../hooks/useParentDashboardMetrics';
import { useChildProfileState } from '../hooks/useChildProfileState';
import { MetricCard } from '../MetricCard';
import { ChildProgressChart } from '../../charts/ChildProgressChart';

export const ParentChildProgressSection: React.FC = () => {
  const board = useBoard();
  const { getPointsMetrics } = board;
  
  const { childrenUsers, logsByUserMap, get7DayCompletionData } = useParentDashboardMetrics();
  const {
    editingChildId,
    setEditingChildId,
    editChildName,
    setEditChildName,
    editChildAvatar,
    setEditChildAvatar,
    editChildAge,
    setEditChildAge,
    editChildAgeGroup,
    setEditChildAgeGroup,
    editChildPin,
    setEditChildPin,
    saveProfileLoading,
    saveProfileMessage,
    handleStartEditChild,
    handleApplyAgeBasedChores,
    handleSaveChildProfile,
  } = useChildProfileState();

  return (
    <div className="grid md:grid-cols-2 gap-6" id="parent-tab-children">
      {childrenUsers.map((child) => {
        const p = getPointsMetrics(child.id);
        const childLogs = (logsByUserMap[child.id] || []).slice(0, 5);

        return (
          <div 
            key={child.id} 
            id={`child-details-card-${child.id}`}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl space-y-6 backdrop-blur-md text-white transition-all duration-150"
          >
            {editingChildId === child.id ? (
              /* Active Child Profile Customizer Form */
              <div className="space-y-4 text-xs font-semibold" id={`edit-child-form-${child.id}`}>
                <div className="border-b border-white/10 pb-2">
                  <h4 className="font-extrabold text-white text-sm">⚙️ Configure Profile: {child.name}</h4>
                  <p className="text-[10px] text-white/50">Modify avatar, age suitability presets, and system parameters.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-white/70 block">Display Name</label>
                  <input 
                    type="text"
                    value={editChildName}
                    onChange={(e) => setEditChildName(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-xl font-bold text-white text-xs whitespace-pre"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/70 block">Child's Age (Years)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 7"
                      value={editChildAge}
                      onChange={(e) => setEditChildAge(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/70 block">Age-suitability Preset</label>
                    <select
                      value={editChildAgeGroup}
                      onChange={(e) => setEditChildAgeGroup(e.target.value as 'toddler' | 'preschool' | 'elementary' | 'teen')}
                      className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-xl text-white font-bold text-xs"
                    >
                      <option value="toddler">Toddler (Age 2-3)</option>
                      <option value="preschool">Preschool (Age 4-5)</option>
                      <option value="elementary">Elementary (Age 6-9)</option>
                      <option value="teen">Teen (Age 10+)</option>
                    </select>
                  </div>
                </div>

                {/* Quick PIN Switcher Setup Option */}
                <div className="space-y-1">
                  <label className="text-white/70 block">Quick Device Switcher PIN (4-Digits)</label>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={editChildPin}
                    onChange={(e) => setEditChildPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-xl text-white text-xs font-mono tracking-widest placeholder-white/20"
                  />
                  <span className="text-[9px] text-white/40 block">Optional: allows quick switching to this member on the device without signing out.</span>
                </div>

                {/* Avatar Selection Picker Emoji List */}
                <div className="space-y-1.5">
                  <label className="text-white/70 block">Choose Cute Profile Avatar</label>
                  <div className="grid grid-cols-6 gap-2 bg-neutral-900/50 p-2.5 rounded-xl border border-white/5">
                    {['👧', '👦', '🦄', '🦖', '🐼', '🦊', '🚀', '🎨', '⚽', '🌟', '🦸‍♂️', '🐈'].map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setEditChildAvatar(emoji)}
                        className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition active:scale-95 ${editChildAvatar === emoji ? 'bg-teal-500/20 border border-teal-400 scale-110' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Preset Chore Injector Button */}
                <div className="bg-teal-500/5 border border-teal-500/10 p-3 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-teal-300 block">Age Chore Generator Accent</span>
                  <p className="text-[10px] text-white/60 leading-normal font-sans">
                    Want to save time? Instantly populate recommended {editChildAgeGroup}-suited chores (e.g., bed making, habit tracking) directly into the registry of template options.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleApplyAgeBasedChores(editChildAgeGroup)}
                    className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/35 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition active:scale-95 cursor-pointer"
                  >
                    ⚡ Generate Recommended {editChildAgeGroup.toUpperCase()} Chores
                  </button>
                </div>

                {/* Notification Banner */}
                {saveProfileMessage && (
                  <div className="text-[10px] text-teal-300 bg-teal-500/10 border border-teal-500/20 p-2.5 rounded-xl leading-relaxed">
                    {saveProfileMessage}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={saveProfileLoading}
                    onClick={() => handleSaveChildProfile(child.id)}
                    className="grow bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition disabled:opacity-50 active:scale-95 cursor-pointer text-center"
                  >
                    {saveProfileLoading ? "Syncing..." : "Save Configurations"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingChildId(null)}
                    className="bg-white/5 hover:bg-white/10 text-white/70 py-2 px-4 rounded-xl text-[11px] font-black uppercase transition active:scale-95 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Child Metrics View with Extra Age Parameters */
              <>
                <div className="flex justify-between items-start pb-3 border-b border-white/10" id={`child-card-header-${child.id}`}>
                  <div className="flex gap-3 items-center">
                    <span className="text-4xl bg-white/5 border border-white/5 p-2 rounded-2xl leading-none">{child.avatar || '👧'}</span>
                    <div>
                      <h4 className="font-extrabold text-white text-base">{child.name}</h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-white/10 text-white/80 border border-white/5 px-2 py-0.5 rounded-full font-bold">
                          {child.age ? `${child.age} yrs` : 'Age N/A'}
                        </span>
                        {child.ageGroup && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                            {child.ageGroup} preset
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartEditChild(child)}
                    className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition active:scale-95 flex items-center gap-1 cursor-pointer"
                    title="Configure Profile settings"
                  >
                    ⚙️ Configure Settings
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <MetricCard
                    id={`child-${child.id}-wallet`}
                    title="Reward Balance"
                    value={`${p.rewardBankBalance} pts`}
                    iconName="Gift"
                    colorVariant="amber"
                  />
                  <MetricCard
                    id={`child-${child.id}-lifetime`}
                    title="Lifetime Earned"
                    value={`${p.lifetimePoints} pts`}
                    iconName="CheckCircle"
                    colorVariant="slate"
                  />
                </div>

                {/* Reusable Child Trend Chart */}
                <ChildProgressChart
                  id={`child-trend-chart-${child.id}`}
                  childName={child.name}
                  avatar={child.avatar}
                  data={get7DayCompletionData(child.id)}
                />

                {/* Recent Chores Logs List */}
                <div className="space-y-3" id={`child-activities-logs-${child.id}`}>
                  <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block">📋 Recent Chore Operations Logs</span>
                  <div className="bg-neutral-900/40 p-4 border border-white/5 rounded-2xl space-y-2">
                    {childLogs.length === 0 ? (
                      <p className="text-[11px] text-white/40 italic flex items-center">No actions logged in the system yet.</p>
                    ) : (
                      childLogs.map((l) => (
                        <div key={l.id} id={`log-item-${l.id}`} className="text-[11px] flex justify-between items-start border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <p className="text-white/80 font-medium leading-relaxed max-w-[70%]">
                            {l.description}
                          </p>
                          <span className="text-[9px] font-mono text-white/30 shrink-0">
                            {new Date(l.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
