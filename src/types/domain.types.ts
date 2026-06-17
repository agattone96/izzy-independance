/**
 * Types and interfaces for Izzy's Independence Board
 */

export type UserRole = 'parent' | 'child' | 'caregiver';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
  pin?: string; // 4-digit PIN for quick device switching
  familyId: string;
  createdAt: string;
  inviteId?: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  tabletSettings: TabletSettings;
  isActiveVisit?: boolean; // toggle-able state within family group
  parentInstructions?: {
    allergies: string;
    bedtime: string;
    emergencyContacts: string;
    customNotes?: string;
  };
}

export interface TabletSettings {
  standardMinutes: number; // default 90
  maxBonusMinutes: number; // default 30
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string; // unique database ID
  key: string; // unique semantic key, e.g. "morning_basics"
  title: string;
  category: string;
  description: string;
  pointValue: number;
  tabletBonusMinutes: number;
  dayOfWeek: string; // "Monday", ..., "All", "Weekday", etc.
  isDaily: boolean;
  isRequired: boolean;
  checklistItems: string[]; // checklist templates
  sortOrder: number;
  active: boolean;
  createdAt: string;
  isVisitTask?: boolean; // separate category of task for visits
  visitTaskKey?: string; // key for specific csv matching
  pausedDuringVisit?: boolean; // masked when active visit is true to prevent streak impact
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  taskKey: string;
  childId: string;
  childName: string;
  completedAt: string; // timestamp
  pointsEarned: number;
  tabletBonusEarned: number;
  status: 'pending_review' | 'approved' | 'needs_fix';
  parentFeedback?: string;
  checklistState: { [itemIndex: number]: boolean }; // tracks checking sub-items
}

export interface Reward {
  id: string;
  key: string;
  title: string;
  category: 'small' | 'medium' | 'weekly' | 'saved_up';
  pointCost: number;
  boundary: string; // description of rules or when it can be used
  requiresApproval: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface RewardLevel {
  category: 'small' | 'medium' | 'weekly' | 'saved_up';
  name: string;
  points: number;
  description: string;
}

export interface RewardRequest {
  id: string;
  rewardId: string;
  rewardTitle: string;
  childId: string;
  childName: string;
  pointCost: number;
  status: 'pending' | 'approved' | 'denied' | 'used';
  requestedAt: string;
  processedAt?: string;
  parentFeedback?: string;
}

export interface Invite {
  id: string;
  familyId: string;
  role: UserRole;
  name: string;
  code: string; // invite link code
  active: boolean;
  createdAt: string;
  claimedByUid?: string;
  claimedAt?: string;
}

export interface HistoryLog {
  id: string;
  familyId: string;
  userId: string;
  userName: string;
  actionType: 'task_completed' | 'task_approved' | 'task_needs_fix' | 'reward_requested' | 'reward_approved' | 'reward_denied' | 'reward_used' | 'settings_updated' | 'csv_import';
  description: string;
  details?: string;
  timestamp: string;
}

export interface BoundaryRule {
  id: string;
  rule: string;
  category: 'Adult Role' | 'Tablet Time' | 'Chores & Rewards' | 'General Care';
  icon: string;
}
