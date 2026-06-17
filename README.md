# Izzy’s Independence Board 🌟

An encouraging, child-centered chore, reward, tablet-time, and boundary-tracking system designed for 11-year-old Izzy and her family. The app features role-based access control, parent reviews, automatic tablet time calculations (guaranteeing standard limits while capping bonus incentives), and bulk CSV imports.

---

## 🚀 Environment Specifications

- **Tech Stack**: React 19, TypeScript 5, Vite 6, Tailwind CSS 4, and Lucide Icons.
- **Port**: Bindings run exclusively on Port `3000` (host `0.0.0.0`) in line with cloud configuration rules.
- **Durable Storage**: Intermediate `firebase-blueprint.json` schemas configured for Cloud Firestore with custom validation helpers and rules.
- **Offline Resiliency**: In the absence of live Firestore credentials, the application implements a fully persistent local storage sandbox state so families can use and test the board offline immediately.

---

## 🎨 Visual System & Copywriting Controls

- **Design Tone**: High-contrast modern light theme leveraging **Teal** (growth & fresh milestones), **Navy** (stable structures & status nodes), **Coral/Amber** (encouragement & alert markers), and **Lavender** (boundaries & custom agreements).
- **Incentive Copywriting**: Avoids punitive, low-esteem labels. Submissions needing refinement are designated as **"Needs a Fix" 🛠️** instead of failures, promoting resilience and learning.

---

## 📊 Database Schema Setup (Firestore Collections)

### 1. `/families/{familyId}` (Documents)
- `id` (string): Unique identifier.
- `name` (string): Family title (e.g. `"Izzy's Family"`).
- `tabletSettings` (map): `standardMinutes` (number), `maxBonusMinutes` (number).
- `createdAt` (timestamp).

### 2. `/families/{familyId}/users/{userId}` (Documents)
- `id` (string): Profile ID.
- `name` (string): Avatar label.
- `role` (enum): `'parent' | 'child'`.
- `avatar` (string): E.g., `"👧"` or `"👩‍💼"`.
- `email` (string, optional).
- `createdAt` (timestamp).

### 3. `/families/{familyId}/tasks/{taskId}` (Documents)
- `id` (string).
- `key` (string): Alpha-numeric identifier for CSV matching (e.g. `"morning_basics"`).
- `title` (string).
- `category` (string): E.g., `"Self Care"`, `"Responsibility"`, `"Growth"`.
- `pointValue` (number).
- `tabletBonusMinutes` (number).
- `dayOfWeek` (string): E.g., `"All"`, `"Weekday"`, `"Weekend"`.
- `isDaily` (boolean).
- `isRequired` (boolean).
- `checklistItems` (list of strings).
- `sortOrder` (number).
- `active` (boolean).

### 4. `/families/{familyId}/completions/{completionId}` (Documents)
- `id` (string).
- `taskId` (string): References parent task.
- `taskKey` (string).
- `childId` (string).
- `childName` (string).
- `completedAt` (timestamp).
- `pointsEarned` (number).
- `tabletBonusEarned` (number).
- `status` (enum): `'pending_review' | 'approved' | 'needs_fix'`.
- `parentFeedback` (string, optional).
- `checklistState` (map of indices -> checked booleans).

### 5. `/families/{familyId}/rewards/{rewardId}` (Documents)
- `id` (string).
- `key` (string).
- `title` (string).
- `category` (enum): `'small' | 'medium' | 'weekly' | 'saved_up'`.
- `pointCost` (number).
- `boundary` (string).
- `requiresApproval` (boolean).
- `active` (boolean).

### 6. `/families/{familyId}/rewardRequests/{requestId}` (Documents)
- `id` (string).
- `rewardId` (string).
- `rewardTitle` (string).
- `childId` (string).
- `childName` (string).
- `pointCost` (number).
- `status` (enum): `'pending' | 'approved' | 'denied' | 'used'`.
- `requestedAt` (timestamp).
- `processedAt` (timestamp, optional).
- `parentFeedback` (string).

---

## 🛠️ Validation & Parsing Rules for CSV Imports

### Tasks CSV Schema
Columns required:
```csv
task_key,title,category,description,point_value,tablet_bonus_minutes,day_of_week,is_daily,is_required,checklist_items,sort_order,active
```
- **Checklist parsing**: Comma-separated or vertical-pipe `|` separated items are dissected into string lists automatically.
- **Constraints**: Rejects negative points, unsafe individual tablet bonus values (> 60m), duplicate keys, and invalid dayOfWeek terms.

### Rewards CSV Schema
Columns required:
```csv
reward_key,title,category,point_cost,boundary,requires_approval,active,sort_order
```
- **Category restrictions**: Only permits `small` (5 pts), `medium` (10 pts), `weekly` (20 pts), or `saved_up` (40 pts) tiers.

---

## 🏃 Run Guide & Compilation Checks

### Install Dependencies
To install standard dev and runtime dependencies:
```bash
npm install
```

### Start Development Server
Starts Vite development process on port 3000:
```bash
npm run dev
```

### Run Automated Unit Tests
A dedicated unit test script is provided in `src/tests/board.test.ts` to logically run through validations of our tracking engine.

You can run the tests using either of the following commands:
```bash
npm test
```
or
```bash
npx tsx src/tests/board.test.ts
```

### Compile Applet for Deployment
Compiles production assets to `dist/`:
```bash
npm run build
```

---

## Verified Baseline

The local code and configuration have been validated and compiled successfully with the following command sequence:

```bash
npm run lint
npm test
npm run build
```

---

## Firebase Console Readiness Checklist

Because local validation and build commands (like `npm run lint`, `npm test`, and `npm run build`) only verify code health and cannot test or configure remote Firebase cloud services, you must manually align your Firebase Console configuration. Firestore operates using a custom database ID dynamically loaded from `firebase-applet-config.json`.

Please map the following checklist requirements inside your Firebase Console to ensure correct runtime operation:

### 1. Enable Authentication Providers
Under **Authentication > Sign-in method**, ensure the following sign-in providers are enabled:
*   **Email/Password**: Needed for core email-based registration and login flows.
*   **Google**: Needed for integrated Google account onboarding and login features.
*   **Email link (passwordless)**: Needed for the Magic Link family onboarding flow.

### 2. Configure Authorized Domains
Under **Authentication > Settings > Authorized Domains**, you must add your current environment domains (e.g., development, preview, and final deployed domains). This ensures secure browser-hosted redirects can process successfully.

### 3. Common Troubleshooting Codes
*   **`auth/operation-not-allowed`**: This error indicates that the specific Auth provider (such as Email/Password, Google, or Email Link) is not enabled under your Firebase Console Sign-in methods.
*   **`auth/unauthorized-domain`**: This error indicates that the current preview, development, or production domain has not been added to the Authorized Domains list in the Firebase Console.

