# Domain Feature Modules (`src/features/`)

Self-contained vertical slices of application logic. Each feature encapsulates its own sub-components, types, logic, and constants to prevent pollution of shared folders.

## Encapsulated Features

- **`auth/`**: Sign In forms, active role credentials, and PIN gates.
- **`family/`**: Family groups settings and co-educator invitations.
- **`invites/`**: Token matching, join links, and confirmation validation.
- **`tasks/`**: Routine lists, checklist items, and completions.
- **`rewards/`**: Point balances, reward requests, and redemption ledger.
- **`csvImport/`**: Verification gateways, template parsing, and database transactions.
- **`visits/` / `caregivers/`**: At-home visit modes, paused background behaviors, and custom bedtime care directions.
- **`boundaries/`**: The agreements screen and safety agreements.
- **`history/`**: Family logging tables, actions, and audit chronicles.
- **`streaks/`**: Monotonic streak calculations and habit preservation rules.
- **`badges/`**: Achievements earned and badge cabinets.
- **`charts/`**: Parent data grids and child progress timelines.
- **`parentReview/`**: Approval and editing widgets for pending child chore requests.
