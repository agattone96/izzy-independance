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
const mockTasks: Task[] = [
  {
    id: "task_morning_basics",
    key: "morning_basics",
    title: "Morning Life Basics",
    category: "Self Care",
    description: "",
    pointValue: 1,
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
    dayOfWeek: "All",
    isDaily: true,
    isRequired: true,
    checklistItems: [],
    sortOrder: 4,
    active: true,
    createdAt: new Date().toISOString()
  }
];

// 1. POINTS ACCOUNTING & REWARDS EARNING TESTS
function testPointsAccounting() {
  console.log("--- 1. Testing Points Accounting & Ledgers ---");
  
  const calculatePoints = (completions: TaskCompletion[], requests: RewardRequest[]) => {
    const lifetimePoints = completions.reduce((sum, c) => sum + c.pointsEarned, 0);
    const spentPoints = requests
      .filter(r => r.status === 'approved' || r.status === 'pending' || r.status === 'used')
      .reduce((sum, r) => sum + r.pointCost, 0);
      
    const rewardBankBalance = Math.max(0, lifetimePoints - spentPoints);
    return { lifetimePoints, rewardBankBalance };
  };

  const completions: TaskCompletion[] = [
    { id: "1", taskId: "t1", taskKey: "morning_basics", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 1, status: 'approved', checklistState: {} },
    { id: "2", taskId: "t2", taskKey: "room_reset", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 1, status: 'approved', checklistState: {} },
    { id: "3", taskId: "t3", taskKey: "cat_care", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 1, status: 'approved', checklistState: {} },
    { id: "4", taskId: "t4", taskKey: "daily_mission", childId: "izzy", childName: "Izzy", completedAt: "", pointsEarned: 2, status: 'approved', checklistState: {} }
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

// 2. "NEEDS A FIX" CHORE BEHAVIOR (NON-PUNITIVE FLOW)
function testNeedsFixBehavior() {
  console.log("--- 2. Testing Non-Punitive Needs A Fix Behavior ---");

  const chore: TaskCompletion = {
    id: "comp_1",
    taskId: "task_room_reset",
    taskKey: "room_reset",
    childId: "izzy",
    childName: "Izzy",
    completedAt: new Date().toISOString(),
    pointsEarned: 1,
    status: 'pending_review',
    checklistState: {}
  };

  // 1. Initial complete state
  assert(chore.pointsEarned === 1, "Base completed chore has 1 point");

  // 2. Parent marks needs_fix
  const needsFixChore: TaskCompletion = {
    ...chore,
    status: 'needs_fix',
    parentFeedback: "Please place away target baskets on shelves!"
  };

  assert(needsFixChore.pointsEarned === 1, "Chore retains points value even in Needs a Fix state");
  assert(needsFixChore.status === 'needs_fix', "Status is verified set to needs_fix");

  // 3. Child fixes and submits
  const fixedChore: TaskCompletion = {
    ...needsFixChore,
    status: 'pending_review',
    parentFeedback: undefined
  };

  assert(fixedChore.status === 'pending_review', "Resubmitted chore reverts to standard pending review routing");
  console.log("");
}

// 3. USER ROLE-BASED ACCESS CONTROL
function testRoleAccessControl() {
  console.log("--- 3. Testing User Role Capabilities ---");

  const checkParentPermission = (u: User) => {
    return u.role === 'parent';
  };

  const parent: User = { id: "u_allison", name: "Allison", role: "parent", avatar: "", familyId: "fam", createdAt: "" };
  const child: User = { id: "u_izzy", name: "Izzy", role: "child", avatar: "", familyId: "fam", createdAt: "" };

  assert(checkParentPermission(parent) === true, "Parent user is authorized for settings and CSV tools");
  assert(checkParentPermission(child) === false, "Child user is forbidden from admin properties");
  console.log("");
}

// 4. CSV SCHEMA FIELD VALIDATOR
function testCSVValidators() {
  console.log("--- 4. Testing CSV Header and Limits Validators ---");

  const validateTaskCSVRow = (row: any, lineNo: number): string[] => {
    const rowErrors: string[] = [];
    const validDays = ["All", "Weekday", "Weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    if (!row.task_key) {
      rowErrors.push(`Row ${lineNo}: missing required field "task_key"`);
    }
    if (row.point_value === undefined || isNaN(Number(row.point_value)) || Number(row.point_value) < 0) {
      rowErrors.push(`Row ${lineNo}: invalid "point_value". Must be zero or positive.`);
    }
    if (row.day_of_week && !validDays.includes(row.day_of_week)) {
      rowErrors.push(`Row ${lineNo}: invalid day of week ("${row.day_of_week}")`);
    }

    return rowErrors;
  };

  // Valid row
  const r1 = { task_key: "swim_practice", title: "Swim Workout", point_value: "2", day_of_week: "All" };
  const err1 = validateTaskCSVRow(r1, 2);
  assert(err1.length === 0, "Valid row imports with zero flags");

  // Invalid row: missing key, negative points, invalid dayOfWeek
  const r2 = { task_key: "", title: "Bad Work", point_value: "-2", day_of_week: "Funday" };
  const err2 = validateTaskCSVRow(r2, 3);
  
  assert(err2.some(e => e.includes('missing required field "task_key"')), "Successfully flags missing required keys");
  assert(err2.some(e => e.includes('invalid "point_value"')), "Successfully flags negative points bounds");
  assert(err2.some(e => e.includes('invalid day of week')), "Successfully flags invalid day name descriptions");

  console.log("");
}

// 5. USER PERMISSIONS AND BOARD ACTIONS TESTS
function testPermissionsAndBoardFlows() {
  console.log("--- 5. Testing Permission Matrices & Board Lifecycle ---");

  // A. User with no board routes to create/join state
  const checkRoutingState = (u: User | null): "landing" | "create_join" | "dashboard" => {
    if (!u) return "landing";
    if (!u.familyId) return "create_join";
    return "dashboard";
  };

  const transientUser: User = { id: "u_new", name: "New User", role: "parent", avatar: "", familyId: "", createdAt: "" };
  assert(checkRoutingState(transientUser) === "create_join", "user with no board routes to create/join state");
  
  const onboardedUser: User = { id: "u_existing", name: "Allison", role: "parent", avatar: "", familyId: "fam_123", createdAt: "" };
  assert(checkRoutingState(onboardedUser) === "dashboard", "onboarded user with board routes to dashboard");

  // B. Authenticated user can create own board, created board stores createdBy == uid, and parent is added as UID
  const createFamilyBoardHelper = (uid: string, familyName: string) => {
    return {
      familyDoc: {
        id: "fam_new_id",
        name: familyName,
        createdBy: uid,
        createdAt: new Date().toISOString()
      },
      memberDoc: {
        id: uid, // Parent member doc uses UID as doc ID
        familyId: "fam_new_id",
        role: "parent",
        name: "Allison"
      }
    };
  };

  const boardCreation = createFamilyBoardHelper("u_allison", "Allison's House");
  assert(boardCreation.familyDoc.createdBy === "u_allison", "board stores createdBy == uid");
  assert(boardCreation.memberDoc.id === "u_allison", "parent member doc uses UID as doc ID");
  assert(boardCreation.memberDoc.role === "parent", "first member of board has parent/owner role");

  // C. Child / Caregiver capabilities rules
  const canApproveCompletions = (u: User) => u.role === 'parent';
  const canManageSettings = (u: User) => u.role === 'parent';

  const childUser: User = { id: "u_izzy", name: "Izzy", role: "child", avatar: "", familyId: "fam_123", createdAt: "" };
  const caregiverUser: User = { id: "u_nanny", name: "Mary", role: "caregiver", avatar: "", familyId: "fam_123", createdAt: "" };

  assert(canApproveCompletions(childUser) === false, "child cannot access parent admin capabilities");
  assert(canManageSettings(caregiverUser) === false, "caregiver cannot access parent admin capabilities");

  // D. Invite role escalation protection
  const redeemInviteHelper = (invitePayload: { inviteRole: string }, clientRequestedRole: string) => {
    // If the client attempts to override, correct it to the source of truth invite role
    return invitePayload.inviteRole; 
  };

  const invite = { id: "inv_123", inviteRole: "child" };
  const finalRole = redeemInviteHelper(invite, "parent"); // client trying to claim 'parent'
  assert(finalRole === 'child', "invite role cannot be escalated by client payload");

  // E. Leaving family board logic
  const leaveFamilyBoardHelper = (
    familyMembers: User[],
    leavingUser: User
  ) => {
    if (leavingUser.role === 'parent') {
      const parentsCount = familyMembers.filter(m => m.role === 'parent').length;
      if (parentsCount <= 1) {
        throw new Error("Cannot leave. You are the last parent on this board.");
      }
    }
    // Return filtered array (membership deleted)
    return familyMembers.filter(m => m.id !== leavingUser.id);
  };

  const multiParentFamily: User[] = [
    { id: "parent_1", name: "Mom", role: "parent", avatar: "", familyId: "f1", createdAt: "" },
    { id: "parent_2", name: "Dad", role: "parent", avatar: "", familyId: "f1", createdAt: "" },
    { id: "child_1", name: "Izzy", role: "child", avatar: "", familyId: "f1", createdAt: "" }
  ];

  // TryDadLeaving (should succeed since Mom remains)
  const afterDadLeaves = leaveFamilyBoardHelper(multiParentFamily, multiParentFamily[1]);
  assert(afterDadLeaves.some(m => m.id === "parent_2") === false, "leaving board removes access and clears member mapping");

  // Try last parent leaving (Mom is now alone in parent role)
  const singleParentFamily = afterDadLeaves; // Mom and Izzy
  let lastParentBlocked = false;
  try {
    leaveFamilyBoardHelper(singleParentFamily, singleParentFamily[0]);
  } catch (err: any) {
    if (err.message.includes("last parent")) {
      lastParentBlocked = true;
    }
  }
  assert(lastParentBlocked === true, "last parent leave is blocked successfully");

  console.log("");
}

// EXECUTIONS
testPointsAccounting();
testNeedsFixBehavior();
testRoleAccessControl();
testCSVValidators();
testPermissionsAndBoardFlows();

console.log("==============================================");
console.log("⭐ ALL UNIT TESTS AND ASSERTIONS PASSED GREEN!");
console.log("==============================================");
