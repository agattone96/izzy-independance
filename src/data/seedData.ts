import { Task, Reward, BoundaryRule } from '../types/domain.types';

export const SEED_TASKS: Task[] = [
  {
    id: "task_morning_basics",
    key: "morning_basics",
    title: "Morning Life Basics",
    category: "Self Care",
    description: "Get dressed, brush teeth, make bed, and do morning stretch.",
    pointValue: 1,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [
      "Brush teeth and wash face",
      "Get dressed in day clothes",
      "Make bed neatly",
      "Drink a cold glass of water"
    ],
    sortOrder: 1,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "task_room_reset",
    key: "room_reset",
    title: "Room Reset",
    category: "Responsibility",
    description: "Clear your floor, put clothes away, and tidy your desk area.",
    pointValue: 1,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [
      "Pick up clean/dirty clothes and place them away or in the hamper",
      "Tidy up desk surface and make sure there are no food items/dishes",
      "Ensure bedroom floor is fully clear of clutter"
    ],
    sortOrder: 2,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "task_cat_care",
    key: "cat_care",
    title: "Cat Care",
    category: "Responsibility",
    description: "Feed the cat, rinse & refill the water bowl, and clean the litter box.",
    pointValue: 1,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [
      "Scoop dirty litter, seal it in bag, and throw it in the main trash",
      "Feed dry/wet food as scheduled",
      "Rinse out and refill water bowl with fresh, cold water"
    ],
    sortOrder: 3,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "task_daily_mission",
    key: "daily_mission",
    title: "Daily Mission",
    category: "Growth",
    description: "30 minutes of deep focus activity (reading, coding, practicing an instrument, or creating art).",
    pointValue: 2,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [
      "Choose focus topic (reading, coding, keyboard practice, or creating art)",
      "Set a focus timer for 30 minutes",
      "Work without screens or phone distractions",
      "Write down or tell parent what you achieved today"
    ],
    sortOrder: 4,
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const SEED_REWARDS: Reward[] = [
  {
    id: "reward_level1",
    key: "small_book",
    title: "Pick a new book from the bookshop or library",
    category: "small",
    pointCost: 5,
    boundary: "Can be requested anytime.",
    requiresApproval: true,
    active: true,
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "reward_level2",
    key: "medium_baking",
    title: "Weekend Baking Session (choose dessert to bake together)",
    category: "medium",
    pointCost: 10,
    boundary: "Requires afternoon weekend slot; Cat Care must be complete.",
    requiresApproval: true,
    active: true,
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "reward_level3",
    key: "weekly_sleepover",
    title: "Friday night Sleepover with 1 friend",
    category: "weekly",
    pointCost: 20,
    boundary: "Must arrange with parent by Wednesday; Room Reset must be sustained.",
    requiresApproval: true,
    active: true,
    sortOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: "reward_level4",
    key: "saved_up_adventure",
    title: "Amusement Park Day Ticket",
    category: "saved_up",
    pointCost: 40,
    boundary: "Scheduled for upcoming dry weather weekend.",
    requiresApproval: true,
    active: true,
    sortOrder: 4,
    createdAt: new Date().toISOString()
  }
];

export const BOUNDARY_RULES: BoundaryRule[] = [
  { id: 'b1', rule: "Routines help build positive independence and daily responsibility.", category: "Positive Habit", icon: "Shield" },
  { id: 'b2', rule: "Keep screens away during family dinner to encourage quality connection.", category: "Family Routine", icon: "Clock" },
  { id: 'b3', rule: "All personal items go back to their proper shelves and spots by end of day.", category: "Family Routine", icon: "Lock" },
  { id: 'b4', rule: "Primary responsibilities must be fully checked off before requesting points rewards.", category: "Chores & Rewards", icon: "Smile" },
  { id: 'b5', rule: "Dishes are brought back immediately to the sink or loaded in the dishwasher.", category: "General Tidy", icon: "Check" },
  { id: 'b6', rule: "Review chore completions together calmly after school or before dinner.", category: "Communication", icon: "Smile" },
  { id: 'b7', rule: "Spills, messes, or clutter are cleaned up by who made them as a simple habit.", category: "General Tidy", icon: "Wrench" }
];
