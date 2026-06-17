import React from 'react';
import { useBoard } from '../../../store';
import { useParentDashboardMetrics } from '../hooks/useParentDashboardMetrics';
import { MetricCard } from '../MetricCard';

export const ParentDashboardSummary: React.FC = () => {
  const { family, rewardRequests } = useBoard();
  const { pendingCompletions } = useParentDashboardMetrics();

  const pendingRewardsCount = rewardRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-white rounded-3xl p-6 shadow-2xl border border-white/10" id="parent-header-banner">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/25 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            🛡️ Master Family Control
          </span>
          <h1 className="text-3xl font-black mt-2 tracking-tight text-white mb-1">
            Allison's Operations Center
          </h1>
          <p className="text-white/80 text-xs mt-1 max-w-xl font-medium">
            Support {family?.name || "Izzy's Family"} habits, approve requested items in real-time, customize chores, bulk load templates, and verify device metrics.
          </p>
        </div>

        <div className="flex gap-4" id="parent-quick-stats">
          <MetricCard
            id="header-stat-reviews"
            title="Pending Reviews"
            value={`${pendingCompletions.length} chores`}
            iconName="ClipboardList"
            colorVariant="teal"
          />
          <MetricCard
            id="header-stat-rewards"
            title="Reward Requests"
            value={`${pendingRewardsCount} items`}
            iconName="Gift"
            colorVariant="indigo"
          />
        </div>
      </div>
    </div>
  );
};
