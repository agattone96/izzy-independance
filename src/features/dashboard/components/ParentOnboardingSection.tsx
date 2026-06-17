import React, { useState } from 'react';
import { useBoard } from '../../../store';

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

export const ParentOnboardingSection: React.FC = () => {
  const { initializeGoogleOrMagicLinkFamily } = useBoard();

  // Setup states (onboarding first login details)
  const [setupParentName, setSetupParentName] = useState('');
  const [setupFamilyName, setSetupFamilyName] = useState('');
  const [setupTimezone, setSetupTimezone] = useState('America/New_York');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupParentName.trim() || !setupFamilyName.trim()) {
      setSetupError("Please fill out all onboarding fields to properly setup your family.");
      return;
    }

    setSetupLoading(true);
    setSetupError(null);
    try {
      await initializeGoogleOrMagicLinkFamily(
        setupParentName.trim(),
        setupFamilyName.trim(),
        setupTimezone
      );
    } catch (err: any) {
      setSetupError(err.message || "Failed to initialize family board database schema.");
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" id="parent-onboarding-panel">
      <div className="max-w-md w-full cosmic-glass rounded-[2.5rem] p-8 border border-white/10 space-y-6 shadow-2xl text-white">
        <div className="space-y-2 text-center">
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/25 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            🚀 Quick Account Initiation
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-3">Configure Family Board</h2>
          <p className="text-white/60 text-xs font-semibold">Finish setting up your primary household database schema.</p>
        </div>

        <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-white/70 block">Parent's Own Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Allison"
              value={setupParentName}
              onChange={(e) => setSetupParentName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl font-bold text-white placeholder-white/25"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Family/Household Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Izzy's Family"
              value={setupFamilyName}
              onChange={(e) => setSetupFamilyName(e.target.value)}
              className="w-full bg-white/10 border border-white/10 p-3 rounded-xl font-bold text-white placeholder-white/25"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Timezone</label>
            <select
              required
              value={setupTimezone}
              onChange={(e) => setSetupTimezone(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 p-3 rounded-xl font-bold text-white cursor-pointer"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {setupError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 rounded-xl leading-normal">
              ⚠️ {setupError}
            </div>
          )}

          <button
            type="submit"
            disabled={setupLoading}
            className="w-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/35 py-3 rounded-xl text-teal-300 font-extrabold uppercase tracking-widest transition cursor-pointer disabled:opacity-50"
          >
            {setupLoading ? 'Initializing Database...' : 'Launch Family Board'}
          </button>
        </form>
      </div>
    </div>
  );
};
