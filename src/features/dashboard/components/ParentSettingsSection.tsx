import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle, 
  ChevronDown, 
  Award, 
  Users, 
  Link as LinkIcon, 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  LogOut, 
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useBoard } from '../../../store';
import { doc, updateDoc, deleteDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { CSVImportSection } from '../../csvImport/CSVImportSection';

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
  const { 
    family, 
    currentUser, 
    updateFamilySettings, 
    users, 
    invites, 
    inviteUser,
    leaveFamilyBoard 
  } = useBoard();

  const [settingsActiveTab, setSettingsActiveTab] = useState<'details' | 'members' | 'invites' | 'roles' | 'csv' | 'danger'>('details');

  // Board Details Forms state
  const [fName, setFName] = useState(family?.name ?? "Izzy's Family");
  const [fTimezone, setFTimezone] = useState(family?.timezone ?? 'America/New_York');
  const [parentPin, setParentPin] = useState(currentUser?.pin || '');
  const [saveDetailsMsg, setSaveDetailsMsg] = useState('');

  // Secure Invite State
  const [invName, setInvName] = useState('');
  const [invRole, setInvRole] = useState<'parent' | 'child' | 'caregiver'>('child');
  const [generatedInvite, setGeneratedInvite] = useState('');
  const [inviteSubmitLoading, setInviteSubmitLoading] = useState(false);

  // Danger Zone actions state
  const [leaveConfirmInput, setLeaveConfirmInput] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (family) {
      setFName(family.name ?? "Izzy's Family");
      setFTimezone(family.timezone ?? 'America/New_York');
    }
  }, [family]);

  useEffect(() => {
    if (currentUser) {
      setParentPin(currentUser.pin || '');
    }
  }, [currentUser]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveDetailsMsg('');
    try {
      await updateFamilySettings({
        familyName: fName,
        timezone: fTimezone,
      });
      
      // Write parent PIN to user subcollection
      if (currentUser && family) {
        await updateDoc(doc(db, 'families', family.id, 'users', currentUser.id), {
          pin: parentPin.trim()
        });
      }
      setSaveDetailsMsg("Board configurations and parental login PIN have been updated successfully!");
    } catch (err: any) {
      setSaveDetailsMsg(`Error: ${err?.message || "Failed to customize settings details."}`);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) return;
    setInviteSubmitLoading(true);
    try {
      const code = await inviteUser(invRole, invName.trim());
      setGeneratedInvite(code);
      setInvName('');
    } catch (err: any) {
      alert("Error creating invite code: " + err?.message);
    } finally {
      setInviteSubmitLoading(false);
    }
  };

  const handleLeaveConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leaveConfirmInput !== 'LEAVE') {
      setLeaveError("Verification text mismatch. Please type exactly 'LEAVE'.");
      return;
    }
    setLeaveLoading(true);
    setLeaveError('');
    try {
      await leaveFamilyBoard();
    } catch (err: any) {
      setLeaveError(err?.message || "Verify permissions or last-parent protection constraints failed.");
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleDeleteBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmInput !== 'DELETE') {
      alert("Verification text mismatch. Please type exactly 'DELETE'.");
      return;
    }

    if (!currentUser || currentUser.role !== 'parent') {
      alert("Access Denied: Only authorized owners/parents can delete family boards.");
      return;
    }

    setDeleteLoading(true);
    try {
      const famId = family?.id;
      if (!famId) throw new Error("No active family found.");

      // 1. Fetch and clean up users in family subcollection & root profile index
      const fUsersSnap = await getDocs(collection(db, 'families', famId, 'users'));
      for (const d of fUsersSnap.docs) {
        await deleteDoc(doc(db, 'families', famId, 'users', d.id));
        await deleteDoc(doc(db, 'users', d.id));
      }

      // 2. Fetch and delete categories of challenges templates
      const fTasksSnap = await getDocs(collection(db, 'families', famId, 'tasks'));
      for (const d of fTasksSnap.docs) {
        await deleteDoc(doc(db, 'families', famId, 'tasks', d.id));
      }

      // 3. Fetch and clean rewards cabinet custom listings
      const fRewardsSnap = await getDocs(collection(db, 'families', famId, 'rewards'));
      for (const d of fRewardsSnap.docs) {
        await deleteDoc(doc(db, 'families', famId, 'rewards', d.id));
      }

      // 4. Clean checklist completions history logs
      const fCompsSnap = await getDocs(collection(db, 'families', famId, 'taskCompletions'));
      for (const d of fCompsSnap.docs) {
        await deleteDoc(doc(db, 'families', famId, 'taskCompletions', d.id));
      }

      // 5. Clean historical logger logs database
      const fLogsSnap = await getDocs(collection(db, 'families', famId, 'logs'));
      for (const d of fLogsSnap.docs) {
        await deleteDoc(doc(db, 'families', famId, 'logs', d.id));
      }

      // 6. Delete the main family configuration card document
      await deleteDoc(doc(db, 'families', famId));

      alert("Destructive cleanup success! Independence board permanently deleted.");
      window.location.reload();
    } catch (err: any) {
      alert("Critical error during board purge: " + err?.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in text-slate-100 font-sans" id="parent-comprehensive-settings-view">
      
      {/* Settings Navigation Sidebar */}
      <div className="hidden md:flex flex-col gap-2 bg-white/5 p-3.5 rounded-3xl border border-white/5 w-64 shrink-0 h-fit" id="settings-vertical-navigation-rail">
        <button 
          onClick={() => setSettingsActiveTab('details')}
          className={`w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left flex items-center gap-3 transition-colors cursor-pointer ${settingsActiveTab === 'details' ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-white border border-teal-500/30 shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          <Settings className="w-4 h-4 text-indigo-400" /> Board Details
        </button>
        <button 
          onClick={() => setSettingsActiveTab('members')}
          className={`w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left flex items-center gap-3 transition-colors cursor-pointer ${settingsActiveTab === 'members' ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-white border border-teal-500/30 shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          <Users className="w-4 h-4 text-emerald-400" /> Family Users
        </button>
        <button 
          onClick={() => setSettingsActiveTab('invites')}
          className={`w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left flex items-center gap-3 transition-colors cursor-pointer ${settingsActiveTab === 'invites' ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-white border border-teal-500/30 shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          <LinkIcon className="w-4 h-4 text-cyan-400" /> Invitations
        </button>
        <button 
          onClick={() => setSettingsActiveTab('roles')}
          className={`w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left flex items-center gap-3 transition-colors cursor-pointer ${settingsActiveTab === 'roles' ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-white border border-teal-500/30 shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-400" /> Roles Matrix
        </button>
        <button 
          onClick={() => setSettingsActiveTab('csv')}
          className={`w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left flex items-center gap-3 transition-colors cursor-pointer ${settingsActiveTab === 'csv' ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-white border border-teal-500/30 shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          <Database className="w-4 h-4 text-purple-400" /> Import / Export
        </button>
        <button 
          onClick={() => setSettingsActiveTab('danger')}
          className={`w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left flex items-center gap-3 transition-colors cursor-pointer ${settingsActiveTab === 'danger' ? 'bg-rose-500/10 text-rose-300 border border-rose-550/20 shadow-lg' : 'text-white/40 hover:text-rose-400 hover:bg-rose-500/5'}`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" /> Danger Zone
        </button>
      </div>

      {/* Mobile navigation tab selector */}
      <div className="md:hidden w-full" id="settings-mobile-navigation-picker">
        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-wider mb-2 block">Choose System Settings Category</label>
        <select 
          value={settingsActiveTab} 
          onChange={(e) => setSettingsActiveTab(e.target.value as any)}
          className="w-full bg-slate-900 border border-white/10 p-3.5 rounded-2xl text-xs font-black text-white uppercase appearance-none"
        >
          <option value="details">📁 Board Details</option>
          <option value="members">👥 Family Users</option>
          <option value="invites">🎟️ Invitations</option>
          <option value="roles">🛡️ Roles Matrix</option>
          <option value="csv">📥 Import / Export</option>
          <option value="danger">⚠️ Danger Zone</option>
        </select>
      </div>

      {/* Settings Active Panel Section */}
      <div className="flex-grow bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-md" id="settings-active-panel-body">
        
        {/* TAB 1: BOARD DETAILS */}
        {settingsActiveTab === 'details' && (
          <div className="space-y-6 animate-fade-in" id="settings-pane-details">
            <div className="border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" /> Board Details Configurations
              </h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">Customize your family board title, physical system timezone, and private parental access PIN codes.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs font-bold font-sans">
              <div className="space-y-2">
                <label className="text-white/70 block uppercase tracking-wide text-[10px]">Family Board Title</label>
                <input 
                  type="text" 
                  required
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 p-3 rounded-xl font-bold text-white placeholder-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-white/70 block uppercase tracking-wide text-[10px]">Timezone Settings</label>
                <select
                  required
                  value={fTimezone}
                  onChange={(e) => setFTimezone(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl font-bold text-white appearance-none cursor-pointer"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-white/70 block uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" /> Parent Access Gate PIN (optional)
                </label>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="e.g. 1234 (blank to disable)"
                  value={parentPin}
                  onChange={(e) => setParentPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900/60 border border-white/10 p-3 rounded-xl font-mono text-white placeholder-white/20 text-center tracking-[1em]"
                />
                <span className="text-[10px] text-white/40 block leading-tight font-medium">Allows fast secure switching from kid interfaces back to the parental overview console on the same screen.</span>
              </div>

              {saveDetailsMsg && (
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold rounded-xl animate-fade-in">
                  ✍️ {saveDetailsMsg}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 py-3.5 rounded-xl text-teal-300 font-black uppercase tracking-wider transition active:scale-95 cursor-pointer text-xs"
              >
                Save Details Configurations
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: FAMILY MEMBERS LIST */}
        {settingsActiveTab === 'members' && (
          <div className="space-y-6 animate-fade-in" id="settings-pane-members">
            <div className="border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Active Family Members
              </h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">Comprehensive roll call of profiles registered on this system board. To invite caregivers or kids, generate invite codes in the next tab.</p>
            </div>

            <div className="space-y-3.5">
              {users.map((member) => (
                <div key={member.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center" id={`settings-member-row-${member.id}`}>
                  <div className="flex gap-3 items-center">
                    <span className="text-3xl bg-neutral-900 border border-white/5 p-2 rounded-xl leading-none">{member.avatar || '👤'}</span>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{member.name} {member.id === currentUser?.id ? <span className="text-[10px] bg-indigo-500/25 px-1.5 py-0.5 rounded text-indigo-300 border border-indigo-500/20 uppercase font-black tracking-widest ml-1">You</span> : null}</h4>
                      <p className="text-[10px] text-white/40 capitalize font-bold mt-0.5">{member.role} Profile</p>
                    </div>
                  </div>
                  <div>
                    {member.role === 'child' ? (
                      <span className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 py-1.5 px-3 rounded-full font-black uppercase tracking-wider">
                        {member.age ? `${member.age} Yrs` : 'Age N/A'}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-white/10 text-white/50 border border-white/5 py-1.5 px-3 rounded-full font-black uppercase tracking-wider">
                        Co-Educator
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-teal-500/5 border border-teal-500/10 p-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-teal-300 block mb-1">💡 Adding children and partners</span>
              <p className="text-[10px] text-white/60 leading-relaxed font-semibold">
                To link a new kid tablet or allow a caregiver/babysitter to check off chores, generate a secure, temporary invite code inside the <strong className="text-white cursor-pointer hover:underline" onClick={() => setSettingsActiveTab('invites')}>Invitations</strong> panel, then enter it on the join home screen.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: INVITATIONS MANAGER */}
        {settingsActiveTab === 'invites' && (
          <div className="space-y-6 animate-fade-in" id="settings-pane-invites">
            <div className="border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-cyan-400" /> Active Membership Invitations
              </h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">Create temporary, secure authorization keys for child devices or additional parents and caregivers.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 items-start">
              {/* Invite Generator Form */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">Issue New Security Invite</span>
                <form onSubmit={handleGenerateInvite} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-white/70 block">Target Person's Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Izzy"
                      value={invName}
                      onChange={(e) => setInvName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-xl font-bold text-white placeholder-white/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/70 block">Allocated Secure Role</label>
                    <select 
                      value={invRole}
                      onChange={(e) => setInvRole(e.target.value as any)}
                      className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-xl text-white font-bold"
                    >
                      <option value="child">Child (logs activities, earns active rewards)</option>
                      <option value="parent">Parent/Co-Educator (master dashboards control panel)</option>
                      <option value="caregiver">Caregiver/Babysitter (review activities, logs visits)</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-500/25 hover:bg-indigo-500/35 border border-indigo-500/30 py-2.5 rounded-xl text-indigo-300 font-extrabold uppercase tracking-wide transition cursor-pointer"
                  >
                    {inviteSubmitLoading ? "Verifying..." : "Generate Security Code"}
                  </button>
                </form>

                {generatedInvite && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl space-y-1.5 animate-scale-in">
                    <span className="text-[9px] font-black text-indigo-300 block uppercase">SUCCESS! SECRET KEY CREATED:</span>
                    <div className="bg-slate-950 border border-white/5 p-2.5 rounded-xl font-mono text-center font-black text-white text-base select-all">
                      {generatedInvite}
                    </div>
                    <p className="text-[9px] text-white/50 leading-tight">Share this security key with your family member. They claim access by selecting the join profile option.</p>
                  </div>
                )}
              </div>

              {/* Active Invite Monitor lists */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Unredeemed Invites Queue</span>
                {invites.length === 0 ? (
                  <p className="text-white/30 text-xs italic">No security invites generated yet.</p>
                ) : (
                  <div className="space-y-2">
                    {invites.map((invite) => (
                      <div key={invite.id} className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-xs flex justify-between items-center" id={`settings-invite-element-${invite.id}`}>
                        <div>
                          <p className="font-bold text-white leading-tight">{invite.name}</p>
                          <span className="text-[9px] uppercase font-bold text-white/40 mt-1 block">Role: {invite.role}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-teal-400 font-bold block">{invite.code}</span>
                          <span className="text-[9px] text-emerald-400 font-bold mt-1 block uppercase">Active & Waiting</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ROLES & PERMISSIONS MATRIX REFERENCE */}
        {settingsActiveTab === 'roles' && (
          <div className="space-y-6 animate-fade-in" id="settings-pane-roles">
            <div className="border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" /> System Roles & Permissions Matrix
              </h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">Your household rules require robust security boundaries. Here is the active system permissions schema.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40">
              <table className="w-full text-xs text-left text-slate-100 font-medium">
                <thead className="bg-white/5 border-b border-white/10 text-white font-bold">
                  <tr>
                    <th scope="col" className="p-4 uppercase tracking-wider text-[10px] text-slate-400">Capability / Feature</th>
                    <th scope="col" className="p-4 uppercase tracking-wider text-[10px] text-rose-300">Child</th>
                    <th scope="col" className="p-4 uppercase tracking-wider text-[10px] text-emerald-300">Caregiver</th>
                    <th scope="col" className="p-4 uppercase tracking-wider text-[10px] text-teal-300">Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  <tr>
                    <td className="p-4 font-bold text-white flex flex-col">
                      <span>Daily Dashboard Summary</span>
                      <span className="text-[10px] text-white/40 font-semibold normal-case mt-0.5">Check chore status & request logs</span>
                    </td>
                    <td className="p-4 text-emerald-450 font-black">✅ YES</td>
                    <td className="p-4 text-emerald-450 font-black">✅ YES</td>
                    <td className="p-4 text-emerald-450 font-black">✅ YES</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white flex flex-col">
                      <span>Log chore check-offs</span>
                      <span className="text-[10px] text-white/40 font-semibold normal-case mt-0.5">Submit daily checklist tasks</span>
                    </td>
                    <td className="p-4 text-emerald-450 font-black">✅ YES</td>
                    <td className="p-4 text-emerald-450 font-black">✅ YES</td>
                    <td className="p-4 text-emerald-450 font-black">✅ YES</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white flex flex-col">
                      <span>Approve Completions & Claims</span>
                      <span className="text-[10px] text-white/40 font-semibold normal-case mt-0.5">Authorize points allocation</span>
                    </td>
                    <td className="p-4 text-rose-500 font-black">❌ NO</td>
                    <td className="p-4 text-emerald-455 font-black">✅ YES</td>
                    <td className="p-4 text-emerald-455 font-black">✅ YES</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white flex flex-col">
                      <span>Create & Modify Chores / Prizes</span>
                      <span className="text-[10px] text-white/40 font-semibold normal-case mt-0.5">Edit registries & template values</span>
                    </td>
                    <td className="p-4 text-rose-500 font-black">❌ NO</td>
                    <td className="p-4 text-rose-500 font-black">❌ NO</td>
                    <td className="p-4 text-emerald-455 font-black">✅ YES</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white flex flex-col">
                      <span>System Settings & Purges</span>
                      <span className="text-[10px] text-white/40 font-semibold normal-case mt-0.5">Access Danger Zone & Bulk tools</span>
                    </td>
                    <td className="p-4 text-rose-500 font-black">❌ NO</td>
                    <td className="p-4 text-rose-500 font-black">❌ NO</td>
                    <td className="p-4 text-emerald-455 font-black">✅ YES</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: IMPORT / EXPORT CSV */}
        {settingsActiveTab === 'csv' && (
          <div className="space-y-6 animate-fade-in" id="settings-pane-csv">
            <div className="border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" /> Bulk Import & System Initialization
              </h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">Need to populate dozens of routine chores or customized rewards? Access the CSV bulk synchronization wizard directly below.</p>
            </div>

            <CSVImportSection />
          </div>
        )}

        {/* TAB 6: DANGER ZONE SEVERS & PURGES */}
        {settingsActiveTab === 'danger' && (
          <div className="space-y-8 animate-fade-in" id="settings-pane-danger">
            <div className="border-b border-red-500/20 pb-4 mb-2">
              <h3 className="text-xl font-black text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Destruction & Board Evacuation Center
              </h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">Caution: These administrative operations are irreversible. Handle with total security care.</p>
            </div>

            {/* SEVER CONNECTION PROFILE LEAVE */}
            <div className="bg-red-500/[0.02] border border-rose-500/10 p-5 rounded-2xl space-y-4 shadow-sm" id="danger-segment-leave">
              <div className="flex items-start gap-3">
                <LogOut className="w-6 h-6 text-rose-400 mt-1 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-white text-sm">Evacuate & Leave Family Board</h4>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">Sever your account's connection to <strong>{family?.name}</strong>. The board's daily activities, histories, and points are left untouched, but your personal sign-in user profile is deleted from the members registry.</p>
                </div>
              </div>

              <form onSubmit={handleLeaveConfirm} className="space-y-4 pt-2">
                <div className="space-y-1.5 text-xs font-semibold">
                  <label className="text-rose-300 block">Type <code className="bg-white/5 px-2 py-0.5 font-mono font-bold text-white tracking-widest text-[11px] rounded border border-white/5">LEAVE</code> to verify security confirmation:</label>
                  <input 
                    type="text" 
                    value={leaveConfirmInput}
                    onChange={(e) => setLeaveConfirmInput(e.target.value)}
                    placeholder="Type LEAVE"
                    className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl font-bold text-white placeholder-white/10 uppercase"
                  />
                </div>

                {leaveError && (
                  <div className="p-3 bg-rose-550/10 border border-rose-500/20 rounded-xl text-rose-300 text-[11px] font-bold">
                    ⚠️ {leaveError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={leaveConfirmInput !== 'LEAVE' || leaveLoading}
                  className="w-full bg-rose-500 text-white disabled:opacity-40 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-600 transition duration-150 disabled:cursor-not-allowed cursor-pointer"
                >
                  {leaveLoading ? "Severing connection..." : "Confirm Evacuation & Leave Board"}
                </button>
              </form>
            </div>

            {/* PURGE BOARD PERMANENT DELETION */}
            <div className="bg-red-500/[0.04] border border-red-500/20 p-5 rounded-2xl space-y-4 shadow-xl" id="danger-segment-delete">
              <div className="flex items-start gap-3">
                <Trash2 className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-white text-sm">Purge & Delete Entire Family Board</h4>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">Completely deletes database references for board templates, point metrics, active checklists, reward cabinets, unexpired invite keys, historical logs, and profiles on <strong>{family?.name}</strong>. Complete Zero-Trust purge.</p>
                </div>
              </div>

              <form onSubmit={handleDeleteBoard} className="space-y-4 pt-2">
                <div className="space-y-1.5 text-xs font-semibold">
                  <label className="text-red-400 block">Type <code className="bg-white/5 px-2 py-0.5 font-mono font-bold text-white tracking-widest text-[11px] rounded border border-white/5">DELETE</code> to verify security confirmation:</label>
                  <input 
                    type="text" 
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl font-bold text-white placeholder-white/10 uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={deleteConfirmInput !== 'DELETE' || deleteLoading}
                  className="w-full bg-red-600 text-white disabled:opacity-40 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 hover:shadow-red-500/10 transition duration-150 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                >
                  {deleteLoading ? "Purging board databases..." : "Irreversibly Purge Board Database"}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
