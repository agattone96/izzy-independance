import { Trophy, Flame, Sparkles, TrendingUp, Star, Crown, PiggyBank, Gift, LucideIcon } from 'lucide-react';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  requirement: (stats: {
    streakDays: number;
    completionsCount: number;
    lifetimePoints: number;
    rewardBankBalance: number;
    highCostRedeemed: boolean;
  }) => { isUnlocked: boolean; progressMsg: string };
}

export interface BadgeGroupDefinition {
  category: string;
  title: string;
  description: string;
  accentBg: string;
  badgeColor: string;
  badges: BadgeDefinition[];
}

export const BADGE_GROUPS: BadgeGroupDefinition[] = [
  {
    category: 'completer',
    title: 'Consistent Completer',
    description: 'Establish superb responsibility habits',
    accentBg: 'from-teal-500/10 to-emerald-500/5 border-teal-500/20',
    badgeColor: 'teal',
    badges: [
      {
        id: 'comp_bronze',
        name: 'First Steps',
        description: 'Completed your very first chore mission!',
        icon: Trophy,
        color: 'text-teal-400 bg-teal-500/20 border-teal-500/30',
        requirement: ({ completionsCount }) => ({
          isUnlocked: completionsCount >= 1,
          progressMsg: `${Math.min(completionsCount, 1)}/1 completed`
        })
      },
      {
        id: 'comp_silver',
        name: 'Habit Hero',
        description: 'Complete chores 3 days in a row.',
        icon: Flame,
        color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        requirement: ({ streakDays }) => ({
          isUnlocked: streakDays >= 3,
          progressMsg: `${Math.min(streakDays, 3)}/3 days`
        })
      },
      {
        id: 'comp_gold',
        name: 'Independence Champ',
        description: 'Complete chores 7 days in a row!',
        icon: Sparkles,
        color: 'text-amber-305 bg-amber-500/20 border-amber-500/30 animate-pulse',
        requirement: ({ streakDays }) => ({
          isUnlocked: streakDays >= 7,
          progressMsg: `${Math.min(streakDays, 7)}/7 days`
        })
      }
    ]
  },
  {
    category: 'points',
    title: 'Point Master',
    description: 'Accumulate lifetime points from chores',
    accentBg: 'from-amber-500/10 to-yellow-500/5 border-amber-500/20',
    badgeColor: 'amber',
    badges: [
      {
        id: 'pts_bronze',
        name: 'Point Pioneer',
        description: 'Earn 10 lifetime points.',
        icon: TrendingUp,
        color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
        requirement: ({ lifetimePoints }) => ({
          isUnlocked: lifetimePoints >= 10,
          progressMsg: `${Math.min(lifetimePoints, 10)}/10 pts`
        })
      },
      {
        id: 'pts_silver',
        name: 'Fifty Club',
        description: 'Amassed 50 lifetime responsibility points!',
        icon: Star,
        color: 'text-amber-350 bg-amber-500/30 border-amber-500/40',
        requirement: ({ lifetimePoints }) => ({
          isUnlocked: lifetimePoints >= 50,
          progressMsg: `${Math.min(lifetimePoints, 50)}/50 pts`
        })
      },
      {
        id: 'pts_gold',
        name: 'The Point Tycoon',
        description: 'Hit the peak of 100 lifetime points!',
        icon: Crown,
        color: 'text-yellow-300 bg-yellow-500/30 border-yellow-500/45 animate-pulse',
        requirement: ({ lifetimePoints }) => ({
          isUnlocked: lifetimePoints >= 100,
          progressMsg: `${Math.min(lifetimePoints, 100)}/100 pts`
        })
      }
    ]
  },
  {
    category: 'saver',
    title: 'Reward Saver',
    description: 'Save points balance or order big rewards',
    accentBg: 'from-rose-500/10 to-purple-500/5 border-rose-500/20',
    badgeColor: 'rose',
    badges: [
      {
        id: 'save_bronze',
        name: 'Frugal Saver',
        description: 'Save 15 points in your wallet bank.',
        icon: PiggyBank,
        color: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
        requirement: ({ rewardBankBalance }) => ({
          isUnlocked: rewardBankBalance >= 15,
          progressMsg: `${Math.min(rewardBankBalance, 15)}/15 pts`
        })
      },
      {
        id: 'save_silver',
        name: 'Value Visionary',
        description: 'Grow your bank wallet to 30 points.',
        icon: Star,
        color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
        requirement: ({ rewardBankBalance }) => ({
          isUnlocked: rewardBankBalance >= 30,
          progressMsg: `${Math.min(rewardBankBalance, 30)}/30 pts`
        })
      },
      {
        id: 'save_gold',
        name: 'Dream Realised',
        description: 'Redeemed a prime weekly or weekly+ reward (20+ pts).',
        icon: Gift,
        color: 'text-rose-400 bg-pink-500/20 border-pink-500/30 animate-pulse',
        requirement: ({ highCostRedeemed }) => ({
          isUnlocked: highCostRedeemed,
          progressMsg: highCostRedeemed ? 'Claimed!' : 'Not claimed yet'
        })
      }
    ]
  }
];
