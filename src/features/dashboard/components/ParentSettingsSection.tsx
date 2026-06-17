import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
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

export const ParentSettingsSection: React.FC = () => {
  const { family, currentUser, updateFamilySettings } = useBoard();

  const [fName, setFName] = useState(family?.name ?? "Izzy's Family");
  const [fTimezone, setFTimezone] = useState(family?.timezone ?? 'America/New_York');
  const [sTime, setSTime] = useState(family?.tabletSettings?.standardMinutes ?? 90);
  const [mBonus, setMBonus] = useState(family?.tabletSettings?.maxBonusMinutes ?? 30);
  const [parentPin, setParentPin] = useState(currentUser?.pin || '');

  useEffect(() => {
    if (family) {
      setFName(family.name ?? "Izzy's Family");
      setFTimezone(family.timezone ?? 'America/New_York');
      setSTime(family.tabletSettings?.standardMinutes ?? 90);
      setMBonus(family.tabletSettings?.maxBonusMinutes ?? 30);
    }
  }, [family]);

  useEffect(() => {
    if (currentUser) {
      setParentPin(currentUser.pin || '');
    }
  }, [currentUser]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    updateFamilySettings({
      familyName: fName,
      timezone: fTimezone,
      standardMinutes: Number(sTime),
      maxBonusMinutes: Number(mBonus)
    });
    
    // Write parent PIN to user subcollection
    if (currentUser && family) {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../../firebase');
      try {
        await updateDoc(doc(db, 'families', family.id, 'users', currentUser.id), {
          pin: parentPin.trim()
        });
      } catch (err) {
        console.error("Failed to commit parent PIN: ", err);
      }
    }
    alert("Family device settings and optional safety PIN updated successfully!");
  };

  return (
    <div className="grid md:grid-cols-2 gap-8" id="parent-tab-settings">
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4 text-white backdrop-blur-md animate-fade-in" id="settings-card">
        <h3 className="font-extrabold text-white border-b border-white/10 pb-3 text-base flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-305" /> System Settings
        </h3>
        
        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-white/70 block">Family Board Title</label>
            <input 
              type="text" 
              required
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-bold font-sans text-white mt-1 placeholder-white/20 whitespace-pre"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Timezone</label>
            <select
              required
              value={fTimezone}
              onChange={(e) => setFTimezone(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-xl font-bold text-white mt-1 appearance-none cursor-pointer"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Parent Access PIN (optional)</label>
            <input 
              type="text" 
              maxLength={4}
              placeholder="e.g. 1234 (blank to disable)"
              value={parentPin}
              onChange={(e) => setParentPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-white mt-1 placeholder-white/20"
            />
            <span className="text-[10px] text-white/40 block mt-0.5 leading-tight font-semibold">PIN required when switching back from child view to parent dashboard.</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-white/70 block">Standard Daily (mins)</label>
              <input 
                type="number" 
                required
                min={0}
                value={sTime}
                onChange={(e) => setSTime(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono mt-1 text-white"
              />
              <span className="text-[10px] text-white/40 block mt-0.5 leading-tight font-semibold">Base guaranteed minutes.</span>
            </div>

            <div className="space-y-1">
              <label className="text-white/70 block">Maximum Daily (mins)</label>
              <input 
                type="number" 
                required
                min={0}
                value={mBonus}
                onChange={(e) => setMBonus(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono mt-1 text-white"
              />
              <span className="text-[10px] text-white/40 block mt-0.5 leading-tight font-semibold">Cap for standard + bonus.</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-teal-500/25 hover:bg-teal-500/35 border border-teal-500/40 py-2.5 rounded-xl text-teal-300 font-extrabold uppercase tracking-wide transition shadow-md cursor-pointer text-[12px]"
          >
            Save System Settings
          </button>
        </form>
      </div>

      {/* Quick instructions panel */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4 text-white/80 text-xs backdrop-blur-md" id="administrative-notes-card">
        <h3 className="font-extrabold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
          <ChevronDown className="w-5 h-5 text-indigo-400 rotate-90" /> Operational Information
        </h3>
        
        <div className="space-y-3 font-medium leading-relaxed">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
            <p className="font-semibold">
              <strong className="text-white font-bold">Live Time Lock limits</strong>: Standard mins represents standard daily base screens guaranteed limit. Maximum minutes caps the overall allotment. Screen conversions are automatically applied when approving chore achievements.
            </p>
          </div>

          <div className="flex gap-2.5 items-start">
            <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="font-semibold">
              <strong className="text-white font-bold">Safe Real-Time Snaps</strong>: This operations center writes straight to Firebase. Multiple children can update their items concurrently and this panel refreshes live with no manual reloading required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
