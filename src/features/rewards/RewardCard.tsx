import React from 'react';
import { Reward } from '../../types/domain.types';
import { Gift, Edit, Trash } from 'lucide-react';

interface RewardCardProps {
  id: string;
  reward: Reward;
  role: 'child' | 'parent';
  bankBalance?: number;
  onRequest?: (reward: Reward) => void;
  onEdit?: (reward: Reward) => void;
  onDelete?: (rewardId: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  id,
  reward,
  role,
  bankBalance = 0,
  onRequest,
  onEdit,
  onDelete
}) => {
  const canAfford = bankBalance >= reward.pointCost;

  let catText = "Small Reward";
  let tagStyle = "bg-sky-500/15 text-sky-300 border border-sky-500/10";

  if (reward.category === 'medium') {
    catText = "Medium Reward";
    tagStyle = "bg-amber-500/15 text-amber-300 border border-amber-500/10";
  } else if (reward.category === 'weekly') {
    catText = "Weekly Reward";
    tagStyle = "bg-purple-500/15 text-purple-300 border border-purple-500/10";
  } else if (reward.category === 'saved_up') {
    catText = "Saved-Up Big";
    tagStyle = "bg-rose-500/15 text-rose-300 border border-rose-500/10";
  }

  return (
    <div
      id={id}
      className="cosmic-glass cosmic-glow-border rounded-[2rem] p-7 shadow-2xl flex flex-col justify-between transition-all duration-500 hover:bg-white/5"
    >
      <div className="space-y-5">
        {/* Header containing categories or cost */}
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${tagStyle}`}>
            {catText}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-black text-cyan-400 font-display text-base drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
              {reward.pointCost} PTS
            </span>
            {role === 'parent' && (
              <div className="flex items-center gap-2 shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(reward)}
                    className="p-1.5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-colors cursor-pointer"
                    title="Edit Reward"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(reward.id)}
                    className="p-1.5 hover:bg-rose-500/10 rounded-xl text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Reward"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reward metadata */}
        <div>
          <h4 className="font-display font-black text-white text-lg flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <Gift className="w-5 h-5 text-indigo-400" />
            </div>
            {reward.title}
          </h4>
          <p className="text-slate-400 text-xs mt-3 italic leading-relaxed font-medium bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-white/20 not-italic mr-1 uppercase text-[9px] font-black tracking-widest">Protocol:</span>
            "{reward.boundary || 'Flexible spending allowed.'}"
          </p>
        </div>
      </div>

      {/* Primary child exchange button */}
      {role === 'child' && onRequest && (
        <div className="pt-6 mt-6 border-t border-white/5">
          <button
            onClick={() => canAfford && onRequest(reward)}
            disabled={!canAfford}
            className={`w-full font-black py-4 px-6 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              canAfford
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/20 hover:scale-[1.02]'
                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed opacity-50'
            }`}
          >
            {canAfford ? 'Redeem Independence Gift' : `Insufficent Credit (${reward.pointCost} PTS)`}
          </button>
        </div>
      )}
    </div>
  );
};
