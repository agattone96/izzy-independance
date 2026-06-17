import React, { useState } from 'react';
import { Plus, Gift, ArrowRight } from 'lucide-react';
import { useBoard } from '../../../store';
import { Reward } from '../../../types/domain.types';
import { useParentDashboardMetrics } from '../hooks/useParentDashboardMetrics';
import { RewardCard } from '../../rewards/RewardCard';

export const ParentRewardOverviewSection: React.FC = () => {
  const { rewards, addNewReward, updateReward, deleteReward, processRewardRequestByParent } = useBoard();
  const { sortedRewardRequests } = useParentDashboardMetrics();

  // Input states Reward Customizer
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewKey, setRewKey] = useState('');
  const [rewTitle, setRewTitle] = useState('');
  const [rewCategory, setRewCategory] = useState<'small' | 'medium' | 'weekly' | 'saved_up'>('small');
  const [rewCost, setRewCost] = useState(5);
  const [rewBoundary, setRewBoundary] = useState('');
  const [rewardFormError, setRewardFormError] = useState('');

  // Reward Request Feedback Status
  const [activeRewardReqId, setActiveRewardReqId] = useState<string | null>(null);
  const [rewardFeed, setRewardFeed] = useState('');

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    setRewardFormError('');

    // Validate inputs
    const trimmedRewKey = rewKey.trim();
    const trimmedRewTitle = rewTitle.trim();
    const trimmedRewBoundary = rewBoundary.trim();
    
    // Normalize Key
    const normalizedKey = trimmedRewKey.toLowerCase().replace(/\s+/g, '_');

    if (!normalizedKey) {
      setRewardFormError("Reward key cannot be empty.");
      return;
    }
    if (!trimmedRewTitle) {
      setRewardFormError("Reward title cannot be empty.");
      return;
    }
    
    // Check duplicate keys (allow keeping same key when editing)
    const duplicateKeyReward = rewards.find(r => r.key === normalizedKey);
    if (duplicateKeyReward && (!editingReward || duplicateKeyReward.id !== editingReward.id)) {
      setRewardFormError(`The Reward Key "${normalizedKey}" is already in use.`);
      return;
    }

    if (Number(rewCost) < 1) {
      setRewardFormError("Point cost must be at least 1.");
      return;
    }

    // Validate category
    const validCategories = ['small', 'medium', 'weekly', 'saved_up'];
    if (!validCategories.includes(rewCategory)) {
        setRewardFormError("Invalid reward category.");
        return;
    }

    if (editingReward) {
      updateReward(editingReward.id, {
        key: normalizedKey,
        title: trimmedRewTitle,
        category: rewCategory,
        pointCost: Number(rewCost),
        boundary: trimmedRewBoundary,
      });
      setEditingReward(null);
    } else {
      addNewReward({
        key: normalizedKey,
        title: trimmedRewTitle,
        category: rewCategory,
        pointCost: Number(rewCost),
        boundary: trimmedRewBoundary,
        requiresApproval: true,
        active: true,
        sortOrder: rewards.length + 1,
      });
    }

    // Reset Reward Form
    setRewKey('');
    setRewTitle('');
    setRewCategory('small');
    setRewCost(5);
    setRewBoundary('');
    setRewardFormError('');
  };

  const handleEditRewardClick = (rew: Reward) => {
    setEditingReward(rew);
    setRewKey(rew.key);
    setRewTitle(rew.title);
    setRewCategory(rew.category);
    setRewCost(rew.pointCost);
    setRewBoundary(rew.boundary);
  };

  const cancelRewardEdit = () => {
    setEditingReward(null);
    setRewKey('');
    setRewTitle('');
    setRewCategory('small');
    setRewCost(5);
    setRewBoundary('');
    setRewardFormError('');
  };

  return (
    <div className="grid md:grid-cols-12 gap-8" id="parent-tab-rewards">
      
      {/* Creator form card */}
      <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4 text-white backdrop-blur-md self-start" id="reward-creator-form">
        <h3 className="font-extrabold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" />
          {editingReward ? "🛠️ Edit Custom Item" : "📝 Add Custom Reward Item"}
        </h3>

        <form onSubmit={handleSaveReward} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-white/70 block">Unique System key (alphanumeric_or_snake)</label>
            <input 
              type="text" 
              required
              placeholder="e.g. extra_gold_pack"
              value={rewKey}
              onChange={(e) => setRewKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              disabled={!!editingReward}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-white placeholder-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Reward Title Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. 15 Mins Minecraft Server Host"
              value={rewTitle}
              onChange={(e) => setRewTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-bold font-sans text-white placeholder-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-white/70 block">Point Cost</label>
              <input 
                type="number" 
                required
                min={1}
                value={rewCost}
                onChange={(e) => setRewCost(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-white"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-white/70 block">Level Tier</label>
              <select 
                value={rewCategory}
                onChange={(e) => setRewCategory(e.target.value as 'small' | 'medium' | 'weekly' | 'saved_up')}
                className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-xl text-white font-bold"
              >
                <option value="small">Small (5 pts)</option>
                <option value="medium">Medium (10 pts)</option>
                <option value="weekly">Weekly (20 pts)</option>
                <option value="saved_up">Saved-Up Big (40 pts)</option>
              </select>
            </div>
          </div>

          {rewardFormError && (
            <div className="text-[11px] text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-505/20">
              {rewardFormError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-white/70 block">Household Agreement / Usage Limit notes</label>
            <input 
              type="text" 
              placeholder="Limit to once daily. Must ask Mommy before activating."
              value={rewBoundary}
              onChange={(e) => setRewBoundary(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-white placeholder-white/20"
            />
          </div>

          <div className="flex gap-2 pt-2">
            {editingReward && (
              <button 
                type="button" 
                onClick={cancelRewardEdit}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-xl text-white font-bold transition"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 py-2.5 rounded-xl text-indigo-305 font-extrabold tracking-wide transition shadow-lg cursor-pointer animate-pulse"
            >
              {editingReward ? "Commit Edits" : "Publish Reward"}
            </button>
          </div>
        </form>

        {/* Pending Approvals Wallet requests checklist inside same tab */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-4 pt-4" id="approved-wallet-rewards">
          <h4 className="font-extrabold text-white text-xs border-b border-white/15 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
            <Gift className="w-4 h-4 text-amber-400" /> Pending Child Exchanges
          </h4>
          
          {sortedRewardRequests.filter(r => r.status === 'pending').length === 0 ? (
            <p className="text-[10px] text-white/40 italic">No reward orders pending checkout review.</p>
          ) : (
            <div className="space-y-3">
              {sortedRewardRequests.filter(r => r.status === 'pending').map((req) => (
                <div key={req.id} id={`req-approval-${req.id}`} className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-xs">{req.rewardTitle}</p>
                      <p className="text-[10px] text-white/50">Requested by <span className="font-bold text-white/70">{req.childName}</span></p>
                    </div>
                    <span className="font-extrabold text-amber-300 shrink-0 font-mono text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-505/15">
                      {req.pointCost} pts
                    </span>
                  </div>

                  {activeRewardReqId === req.id ? (
                    <div className="space-y-2 pt-1" id={`req-pannel-${req.id}`}>
                      <input 
                        type="text"
                        placeholder="Add brief parent feedback / agreement notes..."
                        value={rewardFeed}
                        onChange={(e) => setRewardFeed(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-2 text-[11px] rounded-lg text-white font-medium"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => {
                            processRewardRequestByParent(req.id, 'denied', rewardFeed);
                            setActiveRewardReqId(null);
                            setRewardFeed('');
                          }}
                          className="bg-rose-500/25 text-rose-303 font-bold px-2.5 py-1 rounded text-[10px] hover:bg-rose-505/35 border border-rose-505/30 cursor-pointer"
                        >
                          Deny
                        </button>
                        <button 
                          onClick={() => {
                            processRewardRequestByParent(req.id, 'approved', rewardFeed);
                            setActiveRewardReqId(null);
                            setRewardFeed('');
                          }}
                          className="bg-emerald-500/25 text-emerald-303 font-bold px-3 py-1 rounded text-[10px] hover:bg-emerald-505/35 border border-emerald-505/30 cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveRewardReqId(req.id)}
                      className="w-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-505/25 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      Review Request <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active rewards library list */}
      <div className="md:col-span-8 space-y-6" id="rewards-library-section">
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-extrabold text-white text-base">Active Rewards Wallet Cards ({rewards.length})</h3>
          <p className="text-white/60 text-xs mt-0.5">Browse or customize your custom reward tokens catalog.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6" id="parent-rewards-catalog">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              id={`parent-reward-card-${reward.id}`}
              reward={reward}
              role="parent"
              onEdit={handleEditRewardClick}
              onDelete={deleteReward}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
