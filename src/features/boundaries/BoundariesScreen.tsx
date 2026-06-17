import React from 'react';
import { useBoard } from '../../store';
import { 
  Shield, 
  Clock, 
  Lock, 
  Smile, 
  Wrench, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Shield,
  Clock,
  Lock,
  Smile,
  Wrench,
  Check,
  AlertCircle
};

export const BoundariesScreen: React.FC = () => {
  const { boundaryRules } = useBoard();

  return (
    <div className="max-w-4xl mx-auto p-2" id="boundaries-container">
      <div className="text-center mb-8">
        <span className="bg-teal-500/15 text-teal-300 border border-teal-500/20 font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
          💡 Freedom & Responsibility
        </span>
        <h2 className="text-3xl font-black text-white mt-4 tracking-tight">
          Independence Habits & Guidelines
        </h2>
        <p className="text-white/60 mt-2 max-w-xl mx-auto text-sm">
          “Freedom grows when responsibility grows.” These healthy guidelines help clarify daily follow-through and positive habits.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6" id="boundaries-grid">
        {boundaryRules.map((rule) => {
          const IconComponent = iconMap[rule.icon] || Shield;
          
          let cardColor = "bg-white/5 border-white/10 hover:border-teal-400/40 text-white";
          let iconBg = "bg-teal-500/15 text-teal-350";
          
          if (rule.category === 'Family Routine' || rule.category === 'Positive Habit') {
            cardColor = "bg-white/5 border-white/10 hover:border-indigo-400/40 text-white";
            iconBg = "bg-indigo-500/15 text-indigo-350";
          } else if (rule.category === 'Adult Role') {
            cardColor = "bg-white/5 border-white/10 hover:border-amber-400/40 text-white";
            iconBg = "bg-amber-500/15 text-amber-305";
          } else if (rule.category === 'Chores & Rewards') {
            cardColor = "bg-white/5 border-white/10 hover:border-rose-400/40 text-white";
            iconBg = "bg-rose-500/15 text-rose-350";
          } else if (rule.category === 'General Tidy') {
            cardColor = "bg-white/5 border-white/10 hover:border-emerald-400/40 text-white";
            iconBg = "bg-emerald-500/15 text-emerald-350";
          }

          return (
            <div 
              key={rule.id} 
              id={`boundary-card-${rule.id}`}
              className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-lg flex gap-4 items-start ${cardColor}`}
            >
              <div className={`p-3 rounded-xl shrink-0 ${iconBg} border border-white/5`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white/40 tracking-wider block mb-1">
                  {rule.category}
                </span>
                <p className="text-white font-medium leading-relaxed text-sm">
                  {rule.rule}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-teal-500/5 rounded-2xl border border-teal-500/20 p-6 text-center shadow-xl backdrop-blur-sm" id="boundaries-footer">
        <h4 className="font-extrabold text-teal-300 text-lg flex justify-center items-center gap-2">
          ✨ Stronger Habits, More Autonomy!
        </h4>
        <p className="text-teal-200/85 max-w-2xl mx-auto mt-2 text-xs leading-relaxed font-semibold">
          When primary daily life basics are consistently checked off, it demonstrates readiness to expand trust, unlock opportunities, provide wider ranges of independent decision-making, and bigger weekly reward options!
        </p>
      </div>
    </div>
  );
};
