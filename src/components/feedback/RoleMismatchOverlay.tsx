import React from 'react';

interface RoleMismatchOverlayProps {
  requiredRole: string;
}

export const RoleMismatchOverlay: React.FC<RoleMismatchOverlayProps> = ({ requiredRole }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center z-50 relative" id="role-restricted-view">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-3xl">
          🔒
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white mb-2">Needs-Adult Authentication Lock 🧩</h2>
          <p className="text-white/60 text-xs leading-relaxed">
            This workspace area is restricted. You are currently logged in with a profile that does not match the access clearance of {requiredRole} activities.
          </p>
          <p className="text-teal-200/80 text-[11px] mt-2 font-medium bg-teal-500/10 px-3 py-1 rounded-xl inline-block">
            Pro Tip: You can switch active profile dashboards safely using the choose tools or login panels.
          </p>
        </div>
        <div className="pt-2">
          <a href="/" className="inline-block bg-teal-500/20 border border-teal-500/35 text-teal-300 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-teal-500/30 transition">
            Go to My Proper Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};
