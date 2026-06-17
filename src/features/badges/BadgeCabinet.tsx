import React from 'react';
import { BADGE_GROUPS } from '../../data/badgeDefinitions';

interface BadgeCabinetProps {
  id: string;
  streakDays: number;
  approvedOrPendingCompletionsCount: number;
  lifetimePoints: number;
  rewardBankBalance: number;
  highCostRedeemed: boolean;
}

export const BadgeCabinet: React.FC<BadgeCabinetProps> = ({
  id,
  streakDays,
  approvedOrPendingCompletionsCount,
  lifetimePoints,
  rewardBankBalance,
  highCostRedeemed
}) => {
  const stats = {
    streakDays,
    completionsCount: approvedOrPendingCompletionsCount,
    lifetimePoints,
    rewardBankBalance,
    highCostRedeemed
  };

  return (
    <div id={id} className="grid md:grid-cols-3 gap-6">
      {BADGE_GROUPS.map((group) => (
        <div
          key={group.category}
          id={`${id}-group-${group.category}`}
          className={`bg-gradient-to-br ${group.accentBg} border p-6 rounded-3xl shadow-xl backdrop-blur-md flex flex-col justify-between`}
        >
          <div>
            <h4 className="font-extrabold text-white text-base tracking-tight">{group.title}</h4>
            <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{group.description}</p>

            <div className="space-y-4 mt-6">
              {group.badges.map((b) => {
                const IconComp = b.icon;
                const { isUnlocked, progressMsg } = b.requirement(stats);
                return (
                  <div
                    key={b.id}
                    id={`${id}-badge-${b.id}`}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-black/20 border-white/5 opacity-40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border ${isUnlocked ? b.color : 'text-white/20 bg-white/5 border-white/5'}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="grow">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-xs">{b.name}</span>
                        {isUnlocked ? (
                          <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">Unlocked</span>
                        ) : (
                          <span className="text-[9px] font-bold text-white/30 tracking-wider uppercase">Locked</span>
                        )}
                      </div>
                      <p className="text-white/50 text-[10px] leading-snug mt-0.5">{b.description}</p>
                      
                      {/* Interactive bar indicating completion tasks progress */}
                      <span className="text-[9px] font-mono text-white/40 block mt-1">
                        Progress: {progressMsg}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
