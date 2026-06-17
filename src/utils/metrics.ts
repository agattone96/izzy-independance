import { Family, TaskCompletion, RewardRequest } from '../types/domain.types';

export function calculatePointsMetrics(
  childId: string,
  completions: TaskCompletion[],
  rewardRequests: RewardRequest[]
) {
  const childCompletions = completions.filter(c => c.childId === childId);
  const lifetimePoints = childCompletions.reduce((sum, c) => sum + c.pointsEarned, 0);

  const childRequests = rewardRequests.filter(r => 
    r.childId === childId && 
    (r.status === 'approved' || r.status === 'pending' || r.status === 'used')
  );
  const spentPoints = childRequests.reduce((sum, r) => sum + r.pointCost, 0);
  const rewardBankBalance = Math.max(0, lifetimePoints - spentPoints);

  const todayStr = new Date().toISOString().split('T')[0];
  const pointsEarnedToday = childCompletions
    .filter(c => c.completedAt.startsWith(todayStr) && c.status === 'approved')
    .reduce((sum, c) => sum + c.pointsEarned, 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const limitStr = oneWeekAgo.toISOString();
  const pointsEarnedThisWeek = childCompletions
    .filter(c => c.completedAt >= limitStr && c.status === 'approved')
    .reduce((sum, c) => sum + c.pointsEarned, 0);

  return {
    lifetimePoints,
    spentPoints,
    rewardBankBalance,
    pointsEarnedToday,
    pointsEarnedThisWeek
  };
}
