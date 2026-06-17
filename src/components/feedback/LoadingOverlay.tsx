import React from 'react';
import { Smile } from 'lucide-react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center flex-col gap-4 text-white font-sans overflow-hidden relative" id="applet-booting-spinner">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.1),_transparent_70%)] pointer-events-none" />
      <div className="cosmic-glass cosmic-glow-border p-10 rounded-[4rem] backdrop-blur-3xl flex flex-col items-center justify-center space-y-8 shadow-[0_0_80px_rgba(34,211,238,0.15)] relative z-10 border border-white/10">
        <div className="relative">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full animate-ping absolute inset-0" />
          <div className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
            <Smile className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Independence Matrix</h2>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-cyan-400 block animate-pulse">Synchronizing Family Core</span>
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 animate-slide-progress" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
