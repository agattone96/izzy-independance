import React, { useState, useEffect } from 'react';
import { Reward } from '../../../types/domain.types';
import { Target, Gift, AlertCircle, CheckCircle, Flame, HelpCircle } from 'lucide-react';

interface ChildGoalRewardSectionProps {
  id: string;
  childId: string;
  rewards: Reward[];
  currentPoints: number;
  onSetGoal?: (rewardId: string) => void;
}

export const ChildGoalRewardSection: React.FC<ChildGoalRewardSectionProps> = ({
  id,
  childId,
  rewards,
  currentPoints,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem(`izzy_goal_reward_${childId}`);
    if (saved) {
      setSelectedGoalId(saved);
    } else if (rewards.length > 0) {
      setSelectedGoalId(rewards[0].id);
      localStorage.setItem(`izzy_goal_reward_${childId}`, rewards[0].id);
    }
  }, [childId, rewards]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rid = e.target.value;
    setSelectedGoalId(rid);
    localStorage.setItem(`izzy_goal_reward_${childId}`, rid);
  };

  const selectedGoal = rewards.find(r => r.id === selectedGoalId);

  // Calc progress
  let progressPct = 0;
  let pointsNeeded = 0;
  if (selectedGoal) {
    pointsNeeded = Math.max(0, selectedGoal.pointCost - currentPoints);
    progressPct = selectedGoal.pointCost > 0 
      ? Math.min(100, Math.round((currentPoints / selectedGoal.pointCost) * 100))
      : 100;
  }

  // Rewards affordable now
  const affordableRewards = rewards.filter(r => r.active && r.pointCost <= currentPoints);

  // Rewards close to earning (need <= 5 points and not affordable yet)
  const closeRewards = rewards.filter(r => r.active && r.pointCost > currentPoints && r.pointCost - currentPoints <= 5);

  return (
    <div id={id} className="cosmic-glass cosmic-glow-border p-8 rounded-[2.5rem] shadow-2xl space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2 font-display uppercase tracking-wider">
            <Target className="w-5 h-5 text-cyan-400 animate-pulse-slow" /> Target Goal Reward
          </h3>
          <p className="text-white/60 text-xs mt-1">Select and track your premium dream reward!</p>
        </div>

        <div>
          <select
            value={selectedGoalId}
            onChange={handleGoalChange}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 max-w-xs cursor-pointer"
          >
            <option value="" disabled>-- Pick a Goal --</option>
            {rewards.filter(r => r.active).map(r => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.pointCost} pts)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedGoal ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5" id="active-goal-tracker-card">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="font-bold text-white text-base leading-snug">{selectedGoal.title}</h4>
              <p className="text-white/50 text-xs mt-1 italic">{selectedGoal.boundary || "No custom limitations."}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-white/40 block uppercase tracking-wider font-semibold">Cost</span>
              <span className="font-display font-black text-amber-350 text-lg">{selectedGoal.pointCost} pts</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-white/80">
              <span className="text-cyan-300">{progressPct}% Earned</span>
              <span>{currentPoints} / {selectedGoal.pointCost} pts</span>
            </div>
            <div className="w-full bg-slate-900/60 rounded-full h-3 border border-white/5 overflow-hidden p-[2px]">
              <div 
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium border-t border-white/5">
            <div className="flex items-center gap-1.5">
              {pointsNeeded > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-white/70">Still need <strong className="text-white font-bold">{pointsNeeded} points</strong></span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-bold">Goal Afforded! Go request it in exchanges! 🎉</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-auto text-white/50">
              <HelpCircle className="w-4 h-4 shrink-0 text-white/30" />
              <span>
                {selectedGoal.requiresApproval || selectedGoal.approvalRequired 
                  ? "🔒 Parent review needed" 
                  : "✅ Disbursable instantly!"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-white/40 border border-dashed border-white/10 rounded-2xl italic text-xs">
          Please add and select a goal reward to track progress!
        </div>
      )}

      {/* Auxiliary quick links */}
      <div className="grid md:grid-cols-2 gap-6 pt-2">
        {/* Affordable section */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Affordable Now
          </h4>
          {affordableRewards.length === 0 ? (
            <p className="text-white/40 text-[11px] italic">Keep checking off daily tasks to earn points!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {affordableRewards.slice(0, 3).map(r => (
                <span key={r.id} className="bg-teal-500/10 border border-teal-500/20 text-teal-300 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                  {r.title} ({r.pointCost} pts)
                </span>
              ))}
              {affordableRewards.length > 3 && (
                <span className="text-white/40 text-[10px] flex items-center">+ {affordableRewards.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* Close to earning section */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" /> Close to Earning (Within 5 pts)
          </h4>
          {closeRewards.length === 0 ? (
            <p className="text-white/40 text-[11px] italic">No other rewards in near reach yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {closeRewards.slice(0, 3).map(r => (
                <span key={r.id} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                  {r.title} ({r.pointCost} pts)
                </span>
              ))}
              {closeRewards.length > 3 && (
                <span className="text-white/40 text-[10px] flex items-center">+ {closeRewards.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
