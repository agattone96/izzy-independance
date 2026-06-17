import { Task, Reward } from '../types/domain.types';

export interface CSVTaskValidationResult {
  validTasks: Task[];
  errors: string[];
}

export interface CSVRewardValidationResult {
  validRewards: Reward[];
  errors: string[];
}

export function validateAndParseCSVTasks(
  importedTasks: Array<Partial<Task>>
): CSVTaskValidationResult {
  const errors: string[] = [];
  const validTasks: Task[] = [];

  importedTasks.forEach((raw, idx) => {
    const lineNo = idx + 1;
    if (!raw.key) { errors.push(`Row ${lineNo}: missing required field "task_key"`); return; }
    if (!raw.title) { errors.push(`Row ${lineNo}: missing required field "title"`); return; }
    if (raw.pointValue === undefined || isNaN(raw.pointValue)) { errors.push(`Row ${lineNo}: invalid or missing "point_value"`); return; }
    if (raw.pointValue < 0) { errors.push(`Row ${lineNo}: "point_value" cannot be negative`); return; }
    
    const validDays = ["All", "Weekday", "Weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (raw.dayOfWeek && !validDays.includes(raw.dayOfWeek)) {
      errors.push(`Row ${lineNo}: invalid day of week ("${raw.dayOfWeek}")`);
      return;
    }

    const active = typeof raw.active === 'boolean' ? raw.active : true;
    const isDaily = typeof raw.isDaily === 'boolean' ? raw.isDaily : true;
    const isRequired = typeof raw.isRequired === 'boolean' ? raw.isRequired : true;

    const verified: Task = {
      id: `imported_task_${Date.now()}_${idx}`,
      key: raw.key,
      title: raw.title,
      category: raw.category || 'General',
      description: raw.description || '',
      pointValue: Number(raw.pointValue),
      dayOfWeek: raw.dayOfWeek || 'All',
      isDaily,
      isRequired,
      checklistItems: raw.checklistItems || [],
      sortOrder: raw.sortOrder !== undefined ? Number(raw.sortOrder) : 10,
      active,
      createdAt: new Date().toISOString(),
      isVisitTask: raw.isVisitTask !== undefined ? !!raw.isVisitTask : false,
      visitTaskKey: raw.visitTaskKey || '',
      pausedDuringVisit: raw.pausedDuringVisit !== undefined ? !!raw.pausedDuringVisit : false
    };
    validTasks.push(verified);
  });

  return { validTasks, errors };
}

export function validateAndParseCSVRewards(
  importedRewards: Array<Partial<Reward>>
): CSVRewardValidationResult {
  const errors: string[] = [];
  const validRewards: Reward[] = [];

  importedRewards.forEach((raw, idx) => {
    const lineNo = idx + 1;
    if (!raw.key) { errors.push(`Row ${lineNo}: missing required field "reward_key"`); return; }
    if (!raw.title) { errors.push(`Row ${lineNo}: missing required field "title"`); return; }
    if (raw.pointCost === undefined || isNaN(raw.pointCost)) { errors.push(`Row ${lineNo}: invalid or missing "point_cost"`); return; }
    if (raw.pointCost < 0) { errors.push(`Row ${lineNo}: "point_cost" cannot be negative`); return; }

    const categories = ['small', 'medium', 'weekly', 'saved_up'];
    if (raw.category && !categories.includes(raw.category)) {
      errors.push(`Row ${lineNo}: invalid category level ("${raw.category}"). Options are small, medium, weekly, saved_up`);
      return;
    }

    const active = typeof raw.active === 'boolean' ? raw.active : true;
    const requiresApproval = typeof raw.requiresApproval === 'boolean' ? raw.requiresApproval : true;

    const verifiedOn: Reward = {
      id: `imported_reward_${Date.now()}_${idx}`,
      key: raw.key,
      title: raw.title,
      category: (raw.category as Reward['category']) || 'small',
      pointCost: Number(raw.pointCost),
      boundary: raw.boundary || '',
      requiresApproval,
      active,
      sortOrder: raw.sortOrder !== undefined ? Number(raw.sortOrder) : 10,
      createdAt: new Date().toISOString()
    };
    validRewards.push(verifiedOn);
  });

  return { validRewards, errors };
}
