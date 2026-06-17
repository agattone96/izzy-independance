import React, { useState } from 'react';
import { useBoard } from '../../store';
import { Reward, Task } from '../../types/domain.types';
import { 
  Clock, 
  Gift, 
  Compass, 
  CheckSquare, 
  Flame,
  Trophy
} from 'lucide-react';
import { BoundariesScreen } from '../boundaries/BoundariesScreen';
import { MetricCard } from './MetricCard';
import { TaskCard } from '../tasks/TaskCard';
import { RewardCard } from '../rewards/RewardCard';
import { BadgeCabinet } from '../badges/BadgeCabinet';

export const ChildDashboard: React.FC = () => {
  const { 
    currentUser, 
    family,
    tasks, 
    completions, 
    rewards, 
    rewardRequests,
    completeTaskByChild, 
    fixTaskByChild,
    requestRewardByChild,
    getTabletTimeMetrics,
    getPointsMetrics 
  } = useBoard();

  const [activeTab, setActiveTab] = useState<'missions' | 'activities' | 'boundaries'>('missions');
  const [checklistStates, setChecklistStates] = useState<{ [taskId: string]: { [itemIndex: number]: boolean } }>({});
  const [selectedRewardCategory, setSelectedRewardCategory] = useState<'all' | 'small' | 'medium' | 'weekly' | 'saved_up'>('all');
  const [rewardMsg, setRewardMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!currentUser || currentUser.role !== 'child') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 max-w-lg mx-auto mt-10">
        <Compass className="w-12 h-12 text-indigo-500 mb-4" />
        <h3 className="font-bold text-lg text-slate-800">Child Portal Restricted</h3>
        <p className="text-slate-500 text-sm text-center mt-1">Please select the Child profile from the top-right switch menu to access this dashboard.</p>
      </div>
    );
  }

  const childId = currentUser.id;

  // Real-time calculations
  const tablet = getTabletTimeMetrics(childId);
  const points = getPointsMetrics(childId);

  // Dynamic Responsibility Streak Days Tracker (number of consecutive days with task activity)
  const getResponsibilityStreak = (cid: string): number => {
    let streak = 0;
    const now = new Date();
    
    const getHasCompletionsForDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      return completions.some(c => 
        c.childId === cid && 
        (c.status === 'approved' || c.status === 'pending_review') &&
        c.completedAt.startsWith(dateStr)
      );
    };

    // Check if they completed tasks today (or have started to)
    const completedToday = getHasCompletionsForDate(now);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const completedYesterday = getHasCompletionsForDate(yesterday);

    if (!completedToday && !completedYesterday) {
      return 0;
    }

    let startingDate = now;
    if (!completedToday && completedYesterday) {
      startingDate = yesterday;
    }

    let currentCheck = new Date(startingDate);
    // Limit to prevent infinite loop (safety check) up to 365 days
    for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
      if (getHasCompletionsForDate(currentCheck)) {
        streak++;
        // Go back one day
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streakDays = getResponsibilityStreak(childId);

  const approvedOrPendingCount = completions.filter(c => 
    c.childId === childId && (c.status === 'approved' || c.status === 'pending_review')
  ).length;

  const highCostRedeemed = rewardRequests.some(r => 
    r.childId === childId && 
    (r.status === 'approved' || r.status === 'used') && 
    r.pointCost >= 20
  );

  // Filter tasks to active tasks and map standard four if key matches
  const keyOrder = ["morning_basics", "room_reset", "cat_care", "daily_mission"];
  const todayStr = new Date().toISOString().split('T')[0];
  
  const sortedTasks = [...tasks]
    .filter(t => t.active)
    .sort((a, b) => {
      const idxA = keyOrder.indexOf(a.key);
      const idxB = keyOrder.indexOf(b.key);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.sortOrder - b.sortOrder;
    });

  const getCompletionForTask = (taskId: string) => {
    return completions.find(c => 
      c.taskId === taskId && 
      c.childId === childId && 
      c.completedAt.startsWith(todayStr)
    );
  };

  const handleCheckItem = (taskId: string, itemIdx: number) => {
    setChecklistStates(prev => {
      const taskState = prev[taskId] || {};
      const updatedTaskState = { ...taskState, [itemIdx]: !taskState[itemIdx] };
      return { ...prev, [taskId]: updatedTaskState };
    });
  };

  // Submit completion when child hits complete
  const handleTaskComplete = (task: Task) => {
    const taskState = checklistStates[task.id] || {};
    completeTaskByChild(task.id, childId, taskState);
  };

  const handleFixTask = (completionId: string) => {
    fixTaskByChild(completionId);
  };

  const triggerRewardRequest = (reward: Reward) => {
    const res = requestRewardByChild(reward.id, childId);
    if (res.success) {
      setRewardMsg({ type: 'ok', text: res.message });
    } else {
      setRewardMsg({ type: 'err', text: res.message });
    }
    setTimeout(() => {
      setRewardMsg(null);
    }, 5000);
  };

  // Rewards levels for filtration
  const categories = [
    { value: 'all', label: 'All Levels' },
    { value: 'small', label: 'Small (5 pts)' },
    { value: 'medium', label: 'Medium (10 pts)' },
    { value: 'weekly', label: 'Weekly (20 pts)' },
    { value: 'saved_up', label: 'Saved-Up Big (40 pts)' }
  ];

  const filteredRewards = rewards.filter(r => {
    if (!r.active) return false;
    if (selectedRewardCategory === 'all') return true;
    return r.category === selectedRewardCategory;
  });

  // Today's Date formatter
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-8" id="child-dashboard-root">
      
      {/* 1. Header Banner & Switch Profile Intro */}
      <div className="cosmic-glass cosmic-glow-border p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group" id="child-hero-banner">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-[0.03] font-serif font-black text-[15rem] select-none group-hover:rotate-12 transition-transform duration-1000">
          I
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <span className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4 inline-block text-cyan-300">
              Personalized Mission Hub
            </span>
            <h1 className="text-5xl md:text-6xl font-serif text-white tracking-tight leading-tight italic">
              Good morning, {currentUser.name}!
            </h1>
            <p className="mt-4 text-slate-400 text-sm md:text-base max-w-xl font-medium leading-relaxed">
              Every small action today builds your freedom for tomorrow. Keep your board glowing by completing your routines!
            </p>
          </div>
          
          {/* Quick Date Display */}
          <div className="bg-slate-900/60 backdrop-blur-xl self-start px-8 py-5 rounded-[2rem] text-right border border-white/5 shrink-0 shadow-2xl">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 block opacity-60">Lunar Cycle Date</span>
            <span className="font-display font-black text-white text-xl block mt-1">{formattedToday}</span>
          </div>
        </div>
      </div>

      {/* 2. Calculus Metric Node - Points & Tablet clock */}
      <div className="grid md:grid-cols-12 gap-8" id="child-metrics-grid">
        
        {/* Tablet Clock block */}
        <div className="md:col-span-8 cosmic-glass cosmic-glow-border p-8 rounded-[2.5rem] shadow-2xl space-y-6" id="child-tablet-meters">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <h3 className="font-black text-white text-lg flex items-center gap-3 font-display tracking-widest uppercase text-xs">
              <Clock className="w-5 h-5 text-cyan-400 animate-pulse-slow" /> Device Protocol Clock
            </h3>
            <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/10 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              {tablet.capMessage}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-6" id="tablet-times-breakdown">
            <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5" id="tablet-standard-segment">
              <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">Base Standard Time</span>
              <span className="font-black text-2xl text-white/90 block mt-1">{tablet.standardTime}m</span>
              <span className="text-[9px] text-white/30 block mt-0.5">Guaranteed daily limit</span>
            </div>

            <div className="bg-amber-500/10 p-4 rounded-2xl text-center border border-amber-500/20" id="tablet-bonus-segment">
              <span className="text-[10px] text-amber-305 font-bold block uppercase tracking-wider">Earned Bonus Time</span>
              <span className="font-black text-2xl text-amber-300 block mt-1">
                +{tablet.bonusEarned}m 
                {tablet.bonusEarned !== tablet.bonusCapped && (
                  <span className="text-xs text-amber-400 font-bold ml-1">({tablet.bonusCapped}m cap)</span>
                )}
              </span>
              <span className="text-[9px] text-amber-405 block mt-0.5">Max allowed. 30m maximum</span>
            </div>

            <div className="bg-gradient-to-br from-teal-500/30 to-teal-600/30 text-white p-4 rounded-2xl text-center border border-teal-500/30 shadow-lg relative overflow-hidden" id="tablet-total-segment">
              <span className="text-[10px] text-teal-100 font-bold block uppercase tracking-wider">Total Device Limit</span>
              <span className="font-black text-3xl block mt-1 text-teal-300">{tablet.totalTime}m</span>
              <span className="text-[9px] text-teal-100/70 font-medium block mt-0.5">Active screen range today</span>
            </div>
          </div>

          {/* Visual Progress Slider */}
          <div className="space-y-2 pt-2" id="tablet-slider">
            <div className="flex justify-between text-[11px] font-bold text-white/40">
              <span>90m Standard</span>
              <span>105m Bonus Earned</span>
              <span>120m Maximum Capped</span>
            </div>
            
            {/* Base block progress bar */}
            <div className="w-full h-4 bg-white/10 rounded-full relative overflow-hidden shadow-inner border border-white/5">
              {/* Standard block */}
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 absolute left-0 shadow-md" 
                style={{ width: `${Math.min(100, (tablet.standardTime / 120) * 100)}%` }}
              />
              {/* Bonus block */}
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 absolute transition-all duration-300 shadow-md" 
                style={{ 
                  left: `${Math.min(100, (tablet.standardTime / 120) * 100)}%`, 
                  width: `${Math.min(25, (tablet.bonusCapped / 120) * 100)}%` 
                }}
              />
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/15 p-3.5 rounded-2xl flex gap-2" id="tablet-cap-notice">
            <Clock className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
            <p className="text-[11px] text-indigo-200 leading-relaxed font-semibold">
              {tablet.warningMessage}
            </p>
          </div>
        </div>

        {/* Reusable Metric point nodes */}
        <div className="md:col-span-4 space-y-4" id="child-points-metric-grid">
          <MetricCard
            id="wallet-metric-card"
            title="Reward Bank Wallet"
            value={`${points.rewardBankBalance} pts`}
            subtext="Spent when ordering rewards!"
            iconName="Gift"
            colorVariant="amber"
          />
          <MetricCard
            id="lifetime-metric-card"
            title="Lifetime Points Earned"
            value={`${points.lifetimePoints} pts`}
            subtext="Tracks your overall consistency!"
            iconName="Trophy"
            colorVariant="indigo"
          />
          <MetricCard
            id="streak-metric-card"
            title="Responsibility Streak"
            value={`${streakDays} Days`}
            subtext={streakDays > 0 ? "You're on fire! Keep it burning! 🔥" : "Complete a chore today to start a streak!"}
            iconName="Flame"
            colorVariant="rose"
          />
        </div>
      </div>

      {/* 2.5 Dynamic Achievements Badge Cabinet */}
      <div className="cosmic-glass cosmic-glow-border p-8 rounded-[2.5rem] shadow-2xl space-y-8" id="child-badges-cabinet">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-6">
          <div>
            <h3 className="font-black text-white text-lg flex items-center gap-3 font-display tracking-widest uppercase text-xs">
              <Trophy className="w-5 h-5 text-indigo-400" /> Proficiency Badges
            </h3>
            <p className="text-slate-500 text-xs mt-2 font-medium">Your earned milestones and unlocked potential.</p>
          </div>
          <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              Rank: {streakDays >= 7 ? 'Master' : streakDays >= 3 ? 'Elite' : 'Explorer'}
            </span>
          </div>
        </div>

        {/* Reusable Badge Cabinet */}
        <BadgeCabinet
          id="reusable-badge-cabinet"
          streakDays={streakDays}
          approvedOrPendingCompletionsCount={approvedOrPendingCount}
          lifetimePoints={points.lifetimePoints}
          rewardBankBalance={points.rewardBankBalance}
          highCostRedeemed={highCostRedeemed}
        />
      </div>

      {/* 3. Navigation Tabs within Child Dashboard */}
      <div className="flex border-b border-white/5 gap-10 text-[11px] font-black uppercase tracking-widest" id="child-dash-navigation">
        <button 
          onClick={() => setActiveTab('missions')}
          className={`pb-4 border-b-2 flex items-center gap-3 transition-all px-2 ${activeTab === 'missions' ? 'border-cyan-400 text-white shadow-[0_15px_15px_-15px_rgba(34,211,238,0.5)]' : 'border-transparent text-white/30 hover:text-white/60'}`}
        >
          <CheckSquare className="w-4 h-4" /> Operations
        </button>
        <button 
          onClick={() => setActiveTab('activities')}
          className={`pb-4 border-b-2 flex items-center gap-3 transition-all px-2 ${activeTab === 'activities' ? 'border-purple-400 text-white shadow-[0_15px_15px_-15px_rgba(168,85,247,0.5)]' : 'border-transparent text-white/30 hover:text-white/60'}`}
        >
          <Gift className="w-4 h-4" /> Exchange
        </button>
        <button 
          onClick={() => setActiveTab('boundaries')}
          className={`pb-4 border-b-2 flex items-center gap-3 transition-all px-2 ${activeTab === 'boundaries' ? 'border-indigo-400 text-white shadow-[0_15px_15px_-15px_rgba(99,102,241,0.5)]' : 'border-transparent text-white/30 hover:text-white/60'}`}
        >
          <Compass className="w-4 h-4" /> Protocols
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'missions' && (
        <div className="space-y-6" id="child-missions-pane">
          <div className="flex justify-between items-center">
            <p className="text-white/60 text-xs">
              Check off your checklist items daily, then click the blue button to submit.
            </p>
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Seeded Daily Missions
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" id="daily-missions-cards">
            {sortedTasks.map((task) => {
              const comp = getCompletionForTask(task.id);
              const taskState = checklistStates[task.id] || {};
              
              return (
                <TaskCard
                  key={task.id}
                  id={`child-task-card-${task.id}`}
                  task={task}
                  role="child"
                  completion={comp}
                  checklistState={taskState}
                  onCheckItem={handleCheckItem}
                  onComplete={handleTaskComplete}
                  onFix={handleFixTask}
                  isVisitActive={!!family?.isActiveVisit}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Activities/Rewards Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-6" id="child-activities-pane">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="rewards-filters">
            <div>
              <h3 className="font-extrabold text-white text-lg">Exchange Point Rewards</h3>
              <p className="text-white/60 text-xs mt-0.5">Browse available family items. Your choices are sent for final approval.</p>
            </div>

            {/* Categorization controls */}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedRewardCategory(c.value as any)}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold transition border cursor-pointer ${
                    selectedRewardCategory === c.value 
                      ? 'bg-white/20 text-white border-white/15' 
                      : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {rewardMsg && (
            <div className={`p-4 rounded-xl text-xs font-bold border shadow-md ${
              rewardMsg.type === 'ok' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`} id="reward-exchange-alert">
              {rewardMsg.text}
            </div>
          )}

          {/* Grid of Modular Rewards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" id="child-rewards-list">
            {filteredRewards.length === 0 ? (
              <div className="col-span-full py-12 text-center text-white/40 font-bold">
                No active rewards in category choices. Ask your parents to add customized rewards!
              </div>
            ) : (
              filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  id={`child-reward-option-${reward.id}`}
                  reward={reward}
                  role="child"
                  bankBalance={points.rewardBankBalance}
                  onRequest={triggerRewardRequest}
                />
              ))
            )}
          </div>

          {/* Child active Requests Wallet logs */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl backdrop-blur-md" id="child-requests-log">
            <h4 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-300 animate-pulse" /> My Requested Rewards Wallet
            </h4>
            
            {rewardRequests.filter(r => r.childId === childId).length === 0 ? (
              <p className="text-white/40 text-xs italic">You haven't requested any rewards yet. Do chores to fill points bank!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/90">
                  <thead className="bg-white/5 text-white/40 font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3">Reward Requested</th>
                      <th className="p-3 text-center">Cost</th>
                      <th className="p-3">Date Requested</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Feedback / Parent Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rewardRequests
                      .filter(r => r.childId === childId)
                      .reverse()
                      .map((req) => {
                        let statBadge = "bg-amber-500/15 text-amber-300 border border-amber-500/20";
                        if (req.status === 'approved') statBadge = "bg-teal-500/15 text-teal-300 border border-teal-500/20";
                        else if (req.status === 'denied') statBadge = "bg-rose-500/15 text-rose-300 border border-rose-500/20";
                        else if (req.status === 'used') statBadge = "bg-white/10 text-white/40 border border-white/5";

                        return (
                          <tr key={req.id} id={`child-req-row-${req.id}`} className="hover:bg-white/5">
                            <td className="p-3 font-semibold text-white">{req.rewardTitle}</td>
                            <td className="p-3 text-center font-bold text-amber-300 font-mono">{req.pointCost} pts</td>
                            <td className="p-3 text-white/55">
                              {new Date(req.requestedAt).toLocaleDateString()} at{' '}
                              {new Date(req.requestedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${statBadge}`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-3 italic text-white/60 text-[11px]">
                              {req.parentFeedback || '-'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Boundaries Check tab */}
      {activeTab === 'boundaries' && (
        <BoundariesScreen />
      )}

    </div>
  );
};
