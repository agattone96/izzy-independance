import React, { useState } from 'react';
import { Link } from 'lucide-react';
import { useBoard } from '../../../store';

export const ParentInvitesSection: React.FC = () => {
  const { invites, inviteUser } = useBoard();

  const [invName, setInvName] = useState('');
  const [invRole, setInvRole] = useState<'parent' | 'child' | 'caregiver'>('child');
  const [generatedInvite, setGeneratedInvite] = useState('');

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) return;
    inviteUser(invRole, invName).then((code) => {
      setGeneratedInvite(code);
      setInvName('');
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 font-sans" id="parent-tab-invites">
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4 text-white backdrop-blur-md" id="team-invite-card">
        <h3 className="font-extrabold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
          <Link className="w-5 h-5 text-indigo-400" /> Issue a New Security Invite
        </h3>
        
        <form onSubmit={handleGenerateInvite} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-white/70 block">Family Member's Display Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Izzy"
              value={invName}
              onChange={(e) => setInvName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-bold text-white placeholder-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Target Security Role</label>
            <select 
              value={invRole}
              onChange={(e) => setInvRole(e.target.value as any)}
              className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-xl text-white font-bold"
            >
              <option value="child">Child (Accesses standard boards, logs chores)</option>
              <option value="parent">Parent/Co-Educator (Accesses control panel dashboards)</option>
              <option value="caregiver">Caregiver/Babysitter (Accesses supervision tools, logs visits)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 py-2.5 rounded-xl text-indigo-303 font-extrabold uppercase tracking-wide transition cursor-pointer"
          >
            Generate Code
          </button>
        </form>

        {generatedInvite && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl space-y-2 mt-4 text-xs">
            <span className="text-[9px] font-bold text-indigo-300 block uppercase tracking-wider">SUCCESS! INVITE SECURE CODE CREATED:</span>
            <div className="bg-neutral-900 border border-white/5 p-3 rounded-xl font-mono text-center font-bold text-white text-sm select-all">
              {generatedInvite}
            </div>
            <p className="text-[10px] text-white/50 leading-normal">
              Give this code to your child or partner. They can enter it on the profile join screen to add themselves to this family board securely.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4 text-white backdrop-blur-md" id="team-audit-card">
        <h3 className="font-extrabold text-white text-base border-b border-white/10 pb-3">Active Invite Lists</h3>
        
        {invites.length === 0 ? (
          <p className="text-white/40 text-xs italic">No security invites generated yet. Create one on the left!</p>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div key={invite.id} className="bg-neutral-900/40 p-3 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-white leading-tight">{invite.name}</p>
                  <span className="text-[9px] uppercase font-bold text-white/40 mt-1 block">Role: {invite.role}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-teal-400 font-bold block">{invite.code}</span>
                  <span className="text-[9px] text-emerald-450 font-bold mt-1 block uppercase">Active & Waiting</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
