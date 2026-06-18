import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useBoard } from '../../store';

import { ParentDashboardSummary } from './components/ParentDashboardSummary';
import { ParentTodaySection } from './components/ParentTodaySection';
import { ParentChildProgressSection } from './components/ParentChildProgressSection';
import { ParentTaskOverviewSection } from './components/ParentTaskOverviewSection';
import { ParentRewardOverviewSection } from './components/ParentRewardOverviewSection';
import { ParentHistorySection } from './components/ParentHistorySection';
import { ParentSettingsSection } from './components/ParentSettingsSection';
import { ParentOnboardingSection } from './components/ParentOnboardingSection';

export const ParentDashboard: React.FC = () => {
  const board = useBoard();
  const { currentUser, family } = board;
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'today' | 'children' | 'tasks' | 'rewards' | 'history' | 'settings'>('today');

  // Sync active tab with route queries e.g. ?tab=settings
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['today', 'children', 'tasks', 'rewards', 'history', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [location]);

  // Verify permissions of master role gateway
  if (!currentUser || currentUser.role !== 'parent') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 max-w-lg mx-auto mt-10 rounded-2xl backdrop-blur-md text-white shadow-2xl">
        <ShieldAlert className="w-12 h-12 text-rose-400 mb-4 animate-bounce" />
        <h3 className="font-bold text-lg text-white">Parental Authentication Required</h3>
        <p className="text-white/60 text-sm text-center mt-1">Please select the Parent profile from the top-right switch menu to access administrative family tools.</p>
      </div>
    );
  }

  // Onboarding setup for brand-new Google or Magic-link parent accounts with no family yet
  if (!family || !board.authenticatedUser?.familyId) {
    return <ParentOnboardingSection />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in" id="parent-dashboard-mother-pannel">
      
      {/* Overview stats bar */}
      <ParentDashboardSummary />

      {/* Dynamic Tab customizer layout */}
      <div className="flex flex-wrap gap-2.5 bg-white/5 p-2 rounded-2xl border border-white/5 shadow-inner" id="parent-tabs-navigation">
        {(['today', 'children', 'tasks', 'rewards', 'history', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-btn-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition duration-300 active:scale-95 cursor-pointer ${
              activeTab === tab
                ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-white border border-teal-500/30 shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active page views */}
      {activeTab === 'today' && <ParentTodaySection />}
      {activeTab === 'children' && <ParentChildProgressSection />}
      {activeTab === 'tasks' && <ParentTaskOverviewSection />}
      {activeTab === 'rewards' && <ParentRewardOverviewSection />}
      {activeTab === 'history' && <ParentHistorySection />}
      {activeTab === 'settings' && <ParentSettingsSection />}

    </div>
  );
};
