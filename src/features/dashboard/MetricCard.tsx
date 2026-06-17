import React from 'react';
import * as Icons from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  iconName: keyof typeof Icons;
  colorVariant?: 'teal' | 'indigo' | 'amber' | 'rose' | 'slate';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtext,
  iconName,
  colorVariant = 'slate',
  onClick
}) => {
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  const colorStyles = {
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-300 hover:bg-teal-500/15',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/15',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/15',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/15',
    slate: 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
  };

  const ringStyles = {
    teal: 'ring-teal-500/20',
    indigo: 'ring-indigo-500/20',
    amber: 'ring-amber-500/20',
    rose: 'ring-rose-500/20',
    slate: 'ring-white/10'
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`cosmic-glass cosmic-glow-border rounded-[2rem] p-6 shadow-2xl transition-all duration-500 flex items-center justify-between group ${
        onClick ? 'cursor-pointer hover:bg-white/5 active:scale-95' : ''
      } ${colorStyles[colorVariant]}`}
    >
      <div className="space-y-2 grow">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block font-display">
          {title}
        </span>
        <h3 className="text-3xl font-black tracking-tighter text-white leading-none font-display">
          {value}
        </h3>
        {subtext && (
          <p className="text-xs text-white/60 font-medium leading-relaxed mt-1">
            {subtext}
          </p>
        )}
      </div>
      
      {IconComponent && (
        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/10`}>
          <IconComponent className="w-6 h-6 text-inherit animate-pulse-slow" />
        </div>
      )}
    </div>
  );
};
