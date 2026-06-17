import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { InviteForm } from '../features/invites/InviteForm';

export const JoinPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto my-12 cosmic-glass cosmic-glow-border rounded-[3rem] p-10 space-y-8 shadow-[0_0_80px_rgba(34,211,238,0.1)] relative overflow-hidden" id="join-invite-pane">
       {/* Visual Accents */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
       
       <div className="text-center space-y-4 relative z-10">
         <div className="p-5 bg-gradient-to-tr from-emerald-400/20 to-teal-500/20 border border-white/10 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
           <Users className="w-10 h-10" />
         </div>
         <div className="space-y-1">
           <h2 className="text-3xl font-black text-white tracking-widest uppercase italic">Join Family</h2>
           <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto">
             Enter Invitation Code to Begin
           </p>
         </div>
       </div>

      <div className="relative z-10">
        <InviteForm initialInviteCode={token || ''} onSuccess={(msg) => {
          alert(msg);
          navigate('/');
        }} />
      </div>

      <div className="text-center mt-6 relative z-10">
         <button 
           onClick={() => navigate('/login')}
           className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition cursor-pointer"
         >
           Already Joined? Back to Sign In
         </button>
      </div>
    </div>
  );
};
