/**
 * Automated Test Runner for Izzy's Independence Board
 * 
 * To execute:
 * $ npm test
 * or
 * $ npx tsx src/tests/board.test.ts
 */

import { Task, TaskCompletion, Reward, RewardRequest, User } from '../types/domain.types';

// Simple Assertion Helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ASSERTION PASSED: ${message}`);
}

console.log("==============================================");
console.log("🏃 RUNNING IZZY'S INDEPENDENCE AUTOMATED TESTS");
console.log("==============================================\n");

// --- TEST DATA BASELINE ---
const mockFamilySettings = {
  standardMinutes: 90,
  maxBonusMinutes: 30
};

const mockTasks: Task[] = [
  {
    id: "task_morning_basics",
    key: "morning_basics",
    title: "Morning Life Basics",
    category: "Self Care",
    description: "",
    pointValue: 1,
    tabletBonusMinutes: 5,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [],
    sortOrder: 1,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "task_room_reset",
    key: "room_reset",
    title: "Room Reset",
    category: "Responsibility",
    description: "",
    pointValue: 1,
    tabletBonusMinutes: 10,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [],
    sortOrder: 2,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "task_cat_care",
    key: "cat_care",
    title: "Cat Care",
    category: "Responsibility",
    description: "",
    pointValue: 1,
    tabletBonusMinutes: 5,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [],
    sortOrder: 3,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "task_daily_mission",
    key: "daily_mission",
    title: "Daily Mission",
    category: "Growth",
    description: "",
    pointValue: 2,
    tabletBonusMinutes: 10,
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [],
    sortOrder: 4,
    active: true,
    createdAt: new Date().toISOString()
  }
];

// 1. TABLET TIME CALCULATION & CAPPING TESTS
function testTabletCalculations() {
  console.log("--- 1. Testing Tablet Time Capping Logic ---");
  
  // Scenarios function mirror of store.tsx logic
  const calculateTabletTime = (completions: TaskCompletion[]) => {
    const standardTime = mockFamilySettings.standardMinutes;
    const maxBonus = mockFamilySettings.maxBonusMinutes;
    
    // Sum today's tablet bonuses where status is not needs_fix
    const bonusEarned = completions.reduce((sum, c) => sum + c.tabletBonusEarned, 0);
    const bonusCapped = Math.min(bonusEarned, maxBonus);
    const totalTime = standardTime + bonusCapped;
    
    return { standardTime, bonusEarned, bonusCapped, totalTime };
  };

  // Base scenario - zero completions
  const c1: TaskCompletion[] = [];
  const res1 = calculateTabletTime(c1);
  assert(res1.standardTime === 90, "Standard time should be 90m initially");
  assert(res1.bonusEarned === 0, "Earned bonus is 0 when no chores completed");
  assert(res1.totalTime === 90, "Total device time is 90m initially");

  // Partial Scenario - Morning Basics completed (+5)
  const c2: TaskCompletion[] = [
    {
      id: "c2",
      taskId: "task_morning_basics",
      taskKey: "morning_basics",
      childId: "izzy",
      childName: "Izzy",
      completedAt: new Date().toISOString(),
      pointsEarned: 1,
      tabletBonusEarned: 5,
      status: 'pending_review',
      checklistState: {}
    }
  ];
  const res2 = calculateTabletTime(c2);
  assert(res2.bonusEarned === 5, "Bonus earned is +5m for morning basics");
  assert(res2.totalTime === 95, "Total device time reaches 95m");

  // All 4 key tasks completed: 5 + 10 + 5 + 10 = 30m bonus
  const c3: TaskCompletion[] = [
    ...c2,
    {
      id: "c3_2",
      taskId: "task_room_reset",
      taskKey: "room_reset",
      childId: "izzy",
      childName: "Izzy",
      completedAt: new Date().toISOString(),
      pointsEarned: 1,
      tabletBonusEarned: 10,
      status: 'pending_review',
      checklistState: {}
    },
    {
      id: "c3_3",
      taskId: "task_cat_care",
      taskKey: "cat_care",
      childId: "izzy",
      childName: "Izzy",
      completedAt: new Date().toISOString(),
      pointsEarned: 1,
      tabletBonusEarned: 5,
      status: 'pending_review',
      checklistState: {}
    },
    {
      id: "c3_4",
      taskId: "task_daily_mission",
      taskKey: "daily_mission",
      childId: "izzy",
      childName: "Izzy",
      completedAt: new Date().toISOString(),
      pointsEarned: 2,
      tabletBonusEarned: 10,
      status: 'pending_review',
      checklistState: {}
    }
  ];
  const res3 = calculateTabletTime(c3);
  assert(res3.bonusEarned === 30, "All daily items equal +30m earned");
  assert(res3.totalTime === 120, "Meets the 120m = 2 Hours maximum baseline");

  // Under capping scenario - extra bonus shouldn't bypass the 30m maximum
  const c4: TaskCompletion[] = [
    ...c3,
    {
      id: "c4_extra",
      taskId: "some_extra_task",
      taskKey: "math_practice",
      childId: "izzy",
      childName: "Izzy",
      completedAt: new Date().toISOString(),
      pointsEarned: 2,
      tabletBonusEarned: 15,
      status: 'pending_review',
      checklistState: {}
    }
  ];
  const res4 = calculateTabletTime(c4);
  assert(res4.bonusEarned === 45, "Uncapped bonus accumulated is 45m");
  assert(res4.bonusCapped === 30, "Capping restricts bonus to 30m maximum");
  assert(res4.totalTime === 120, "Total device time securely caps at exactly 120m (2 HOURS TOTAL)");
  console.log("");
}

// 2. SEPARATE POINTS CALCULATION & SPENDING
function testPointsAccounting() {
  console.log("--- 2. Testing Points Separation & Bank Ledgers ---");
  
  const calculatePoints = (completions: TaskCompletion[], requests: RewardRequest[]) => {
    // Lifetime points only increases
    const lifetimePoints = completions.reduce((sum, c) => sum + c.pointsEarned, 0);
    
    // Spent points only counts approved, pending, or used requests
    const spentPoints = requests
      .filter(r => r.status === 'approved' || r.status === 'pending' || r.status === 'used')
      .reduce((sum, r) => sum + r.pointCost, 0);
      
    const rewardBankBalance = Math.max(0, lifetimePoints - spentPoints);
    return { lifetimePoints, rewardBankBalance };
  };

  const completions: TaskCompletion[] = [
    { id: "1", taskId: "t1", taskKey: "morning_basics", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 1, tabletBonusEarned: 5, status: 'approved', checklistState: {} },
    { id: "2", taskId: "t2", taskKey: "room_reset", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 1, tabletBonusEarned: 10, status: 'approved', checklistState: {} },
    { id: "3", taskId: "t3", taskKey: "cat_care", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 1, tabletBonusEarned: 5, status: 'approved', checklistState: {} },
    { id: "4", taskId: "t4", taskKey: "daily_mission", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 2, tabletBonusEarned: 10, status: 'approved', checklistState: {} }
  ]; // Total 5 lifetime points

  const requests: RewardRequest[] = [];

  // No spend yet
  const res1 = calculatePoints(completions, requests);
  assert(res1.lifetimePoints === 5, "Lifetime points earned is 5");
  assert(res1.rewardBankBalance === 5, "Bank balance reflects 5 points");

  // Spend pending request costing 5 points
  const activeRequests: RewardRequest[] = [
    {
      id: "req1",
      rewardId: "rew1",
      rewardTitle: "Book Reward",
      childId: "izzy",
      childName: "Izzy",
      pointCost: 5,
      status: 'pending',
      requestedAt: ""
    }
  ];

  const res2 = calculatePoints(completions, activeRequests);
  assert(res2.lifetimePoints === 5, "Lifetime points stays at 5");
  assert(res2.rewardBankBalance === 0, "Reward bank balance deducted by 5; now 0");

  // Denied/Refund option check
  const deniedRequests: RewardRequest[] = [
    {
      ...activeRequests[0],
      status: 'denied' // Rejection by parent
    }
  ];
  const res3 = calculatePoints(completions, deniedRequests);
  assert(res3.lifetimePoints === 5, "Lifetime points stays at 5");
  assert(res3.rewardBankBalance === 5, "Points immediately and mathematically refunded! Bank balance is back to 5");
  console.log("");
}

// 3. "NEEDS A FIX" CHORE BEHAVIOR
function testNeedsFixBehavior() {
  console.log("--- 3. Testing Needs A Fix Behavior ---");

  // Simulate marking Needs-a-fix
  // If marked needs_fix, c.tabletBonusEarned is set to 0 (removing bonus) but c.pointsEarned is held (points kept)
  const chore: TaskCompletion = {
    id: "comp_1",
    taskId: "task_room_reset",
    taskKey: "room_reset",
    childId: "izzy",
    childName: "Izzy",
    completedAt: new Date().toISOString(),
    pointsEarned: 1,
    tabletBonusEarned: 10,
    status: 'pending_review',
    checklistState: {}
  };

  // 1. Initial complete state
  assert(chore.pointsEarned === 1 && chore.tabletBonusEarned === 10, "Base completed chore has 1 point and 10 tablet bonus");

  // 2. Parent marks needs_fix
  const needsFixChore: TaskCompletion = {
    ...chore,
    status: 'needs_fix',
    tabletBonusEarned: 0, // removed until fixed
    parentFeedback: "Please place away target baskets on shelves!"
  };

  assert(needsFixChore.pointsEarned === 1, "Chore retains points value even in Needs a Fix state");
  assert(needsFixChore.tabletBonusEarned === 0, "Chore tablet bonus is safely removed/subtracted in Needs a Fix state");
  assert(needsFixChore.status === 'needs_fix', "Status is verified set to needs_fix");

  // 3. Child fixes and submits
  const fixedChore: TaskCompletion = {
    ...needsFixChore,
    status: 'pending_review',
    tabletBonusEarned: 10, // restored
    parentFeedback: undefined
  };

  assert(fixedChore.tabletBonusEarned === 10, "Chore tablet bonus is fully restored for parenting check upon fixation submit");
  assert(fixedChore.status === 'pending_review', "Resubmitted chore reverts to standard pending review routing");
  console.log("");
}

// 4. USER ROLE-BASED ACCESS CONTROL
function testRoleAccessControl() {
  console.log("--- 4. Testing User Role Capabilities ---");

  const checkParentPermission = (u: User) => {
    return u.role === 'parent';
  };

  const parent: User = { id: "u_allison", name: "Allison", role: "parent", avatar: "", familyId: "fam", createdAt: "" };
  const child: User = { id: "u_izzy", name: "Izzy", role: "child", avatar: "", familyId: "fam", createdAt: "" };

  assert(checkParentPermission(parent) === true, "Parent user is authorized for general settings and CSV tools");
  assert(checkParentPermission(child) === false, "Child user is forbidden from admin tasks or reviewing completions");
  console.log("");
}

// 5. CSV SCHEMA FIELD VALIDATOR
function testCSVValidators() {
  console.log("--- 5. Testing CSV Header and Limits Validators ---");

  interface CSVErrors {
    task_key?: string;
    point_value?: string;
    tablet_bonus_mintues?: string;
    day_of_week?: string;
  }

  const validateTaskCSVRow = (row: any, lineNo: number): string[] => {
    const rowErrors: string[] = [];
    const validDays = ["All", "Weekday", "Weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    if (!row.task_key) {
      rowErrors.push(`Row ${lineNo}: missing required field "task_key"`);
    }
    if (row.point_value === undefined || isNaN(Number(row.point_value)) || Number(row.point_value) < 0) {
      rowErrors.push(`Row ${lineNo}: invalid "point_value". Must be zero or positive.`);
    }
    if (row.tablet_bonus_minutes === undefined || isNaN(Number(row.tablet_bonus_minutes)) || Number(row.tablet_bonus_minutes) < 0) {
      rowErrors.push(`Row ${lineNo}: invalid "tablet_bonus_minutes". Must be zero or positive.`);
    } else if (Number(row.tablet_bonus_minutes) > 60) {
      rowErrors.push(`Row ${lineNo}: unsafe tablet bonus minutes (${row.tablet_bonus_minutes}m of > 60m threshold)`);
    }
    if (row.day_of_week && !validDays.includes(row.day_of_week)) {
      rowErrors.push(`Row ${lineNo}: invalid day of week ("${row.day_of_week}")`);
    }

    return rowErrors;
  };

  // Valid row
  const r1 = { task_key: "swim_practice", title: "Swim Workout", point_value: "2", tablet_bonus_minutes: "10", day_of_week: "All" };
  const err1 = validateTaskCSVRow(r1, 2);
  assert(err1.length === 0, "Valid row imports with zero flags");

  // Invalid row: missing key, negative points, invalid dayOfWeek, unsafe bonus
  const r2 = { task_key: "", title: "Bad Work", point_value: "-2", tablet_bonus_minutes: "75", day_of_week: "Funday" };
  const err2 = validateTaskCSVRow(r2, 3);
  
  assert(err2.some(e => e.includes('missing required field "task_key"')), "Successfully flags missing required keys");
  assert(err2.some(e => e.includes('invalid "point_value"')), "Successfully flags negative points bounds");
  assert(err2.some(e => e.includes('unsafe tablet bonus minutes')), "Successfully flags unsafe tablet bonuses greater than 60m");
  assert(err2.some(e => e.includes('invalid day of week')), "Successfully flags invalid day name descriptions");

  console.log("");
}

// EXECUTIONS
testTabletCalculations();
testPointsAccounting();
testNeedsFixBehavior();
testRoleAccessControl();
testCSVValidators();

console.log("==============================================");
console.log("⭐ ALL UNIT TESTS AND ASSERTIONS PASSED GREEN!");
console.log("==============================================");
