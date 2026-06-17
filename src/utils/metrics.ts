import { Family, TaskCompletion, RewardRequest } from '../types/domain.types';

export function calculateTabletTimeMetrics(
  childId: string,
  family: Family | null,
  completions: TaskCompletion[]
) {
  const standardTime = family?.tabletSettings.standardMinutes || 90;
  const maxBonus = family?.tabletSettings.maxBonusMinutes || 30;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletions = completions.filter(c => 
    c.childId === childId && 
    c.completedAt.startsWith(todayStr)
  );

  const bonusEarned = todayCompletions.reduce((sum, c) => sum + c.tabletBonusEarned, 0);
  const bonusCapped = Math.min(bonusEarned, maxBonus);
  const totalTime = standardTime + bonusCapped;

  const capMessage = "2 HOURS TOTAL = DAILY MAX";
  let warningMessage = "After 2 hours, extra work earns points, not more tablet time.";

  if (bonusEarned > maxBonus) {
    warningMessage = `Amazing! You've qualified for an extra +${bonusEarned - maxBonus}m bonus of work, which has automatically converted entirely to Reward Points since you are at the daily Tablet Max limit! 🌟`;
  }

  return {
    standardTime,
    bonusEarned,
    bonusCapped,
    totalTime,
    capMessage,
    warningMessage
  };
}

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

  return {
    lifetimePoints,
    rewardBankBalance
  };
}
