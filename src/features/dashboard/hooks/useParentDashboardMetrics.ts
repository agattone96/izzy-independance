import { useMemo, useCallback } from 'react';
import { useBoard } from '../../../store';
import { HistoryLog } from '../../../types/domain.types';

export const useParentDashboardMetrics = () => {
  const { completions, users, rewardRequests, logs } = useBoard();

  const pendingCompletions = useMemo(() => {
    return completions.filter(c => c.status === 'pending_review');
  }, [completions]);

  const childrenUsers = useMemo(() => {
    return users.filter(u => u.role === 'child');
  }, [users]);

  const sortedRewardRequests = useMemo(() => {
    return [...rewardRequests].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }, [rewardRequests]);

  const sortedLogs = useMemo(() => {
    return [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logs]);

  const logsByUserMap = useMemo(() => {
    const map: Record<string, HistoryLog[]> = {};
    logs.forEach(l => {
      if (!map[l.userId]) map[l.userId] = [];
      map[l.userId].push(l);
    });
    Object.keys(map).forEach(uId => {
      map[uId].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
    return map;
  }, [logs]);

  // 7-day responsibility growth calculator helper
  const get7DayCompletionData = useCallback((childId: string) => {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const count = completions.filter(c => 
        c.childId === childId && 
        c.status === 'approved' && 
        c.completedAt.startsWith(dateStr)
      ).length;

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ label: dayName, Completed: count });
    }
    return days;
  }, [completions]);

  return {
    pendingCompletions,
    childrenUsers,
    sortedRewardRequests,
    sortedLogs,
    logsByUserMap,
    get7DayCompletionData
  };
};
