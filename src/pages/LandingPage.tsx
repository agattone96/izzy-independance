import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Unlock, Plus, Link, ArrowRight, ShieldCheck, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-6xl space-y-16 relative">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-24 h-24 bg-slate-900 border border-white/10 rounded-[2.5rem] flex items-center justify-center relative shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-40"></div>
                <Sparkles className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-serif text-white tracking-tight leading-[1.1] max-w-3xl mx-auto italic drop-shadow-sm">
              Izzy’s Independence Board
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Helping girls build independence, life skills, and confidence through daily routines, responsibilities, and positive reinforcement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-white/30" id="feature-labels">
            <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Daily Responsibilities
            </div>
            <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Heart className="w-3.5 h-3.5 text-purple-400" />
              Life Skills Growth
            </div>
            <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Safe & Supportive
            </div>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-3 gap-8" id="landing-portals">
          <PortalCard
            onClick={() => navigate('/login')}
            icon={<Unlock className="w-6 h-6" />}
            title="Sign In"
            description="Already have a family board? Sign in to continue where you left off."
            color="cyan"
            delay={0.1}
          />
          <PortalCard
            onClick={() => navigate('/register')}
            icon={<Plus className="w-6 h-6" />}
            title="Create Family Board"
            description="Don't have a board yet? Start here to create one for your family."
            color="purple"
            delay={0.2}
            recommended
          />
          <PortalCard
            onClick={() => navigate('/login?tab=invite')}
            icon={<Link className="w-6 h-6" />}
            title="Join by Invitation"
            description="Were you invited to an existing family board? Use your invitation to join."
            color="indigo"
            delay={0.3}
          />
        </div>

        {/* Footer Action */}
        <div className="flex flex-col items-center gap-8 pt-8">
          <button 
            onClick={() => navigate('/agree-rules')}
            className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            <span>Read Shared Agreement Rules</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-widest text-white/10">
            <span>Built for Families</span>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <span>Privacy First</span>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <span>Independence Focused</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PortalCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'cyan' | 'purple' | 'indigo';
  delay: number;
  recommended?: boolean;
}

const PortalCard: React.FC<PortalCardProps> = ({ onClick, icon, title, description, color, delay, recommended }) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-indigo-500/20 border-cyan-500/20 text-cyan-400 animate-pulse-slow',
    purple: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400 animate-pulse-slow',
    indigo: 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/20 text-indigo-400 animate-pulse-slow',
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`relative p-10 rounded-[2.5rem] bg-slate-900 shadow-2xl border transition-all duration-500 h-full flex flex-col items-center space-y-6 group cursor-pointer ${
        recommended ? 'border-cyan-500/50 scale-105 z-10' : 'border-white/5 hover:border-white/20'
      }`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-cyan-500/40">
          ★ Recommended
        </div>
      )}

      <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-tr transition-transform duration-500 group-hover:scale-110 border ${colorMap[color]}`}>
        {icon}
      </div>

      <div className="space-y-3 text-center">
        <h3 className="text-xl font-bold text-white font-display uppercase tracking-tight">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed font-medium">{description}</p>
      </div>

      <div className="pt-4 mt-auto">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
        </div>
      </div>
    </motion.button>
  );
};
