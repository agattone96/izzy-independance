# Izzy's Independence Board — AI Agent Harness

> **AI-first, spec-driven repository.** Adopt the Deep Work Plan methodology for structured, verifiable work.

---

## 📋 Mandatory Rules

All work in this repository follows these conventions:

### Language & Communication
- **English only** — all code comments, commit messages, documentation, and conversation.
- **Conventional Commits** — format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(board): add tablet time reward tracking`

### Code Quality Gates
- **TypeScript strict mode** — `noImplicitAny`, `strict`, `noUnusedLocals`, `noUnusedParameters`
- **Type-driven design** — discriminated unions, utility types, exhaustive checks
- **Linting**: `npm run lint` must pass before commit
- **Type checking**: `npm run lint` (tsc --noEmit)

### Testing & Validation
- **Test coverage**: All business logic (validators, state transitions, CSV parsing) tested in `src/tests/`
- **Test command**: `npm test` (runs `tsx src/tests/board.test.ts`)
- **Test pattern**: Named test functions, arrange-act-assert, clear error messages
- **Build validation**: `npm run build` must succeed — no broken types or dead code

### Review Gates
- **Pull Request reviews** required before merge to `main`
- **Checklist**: Lint passes, tests pass, build succeeds, no secrets committed
- **Commit history**: Linear, readable history (squash/rebase preferred over merge commits)

### Security & Secrets
- **No secrets in code** — all Firebase keys, API tokens, and credentials come from `.env` or `.env.local`
- **See `docs/SECURITY.md`** for authentication, Firestore rules, and domain setup
- **`.env.example` provided** — shows required environment variables without values

---

## 🎯 Quick Commands

### Development Workflow
```bash
# Install dependencies
npm install

# Start dev server (port 3000, host 0.0.0.0)
npm run dev

# Type-check code (no emit)
npm run lint

# Run unit tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean
```

### Working with Agents

#### Before Starting
1. Read this file (you are here)
2. Skim `docs/PRODUCT_SPEC.md` (product intent, schema, CSV parsing)
3. Skim `docs/ARCHITECTURE.md` (module layout, data flow, Firebase integration)
4. Check `docs/STANDARDS.md` for code style (TypeScript, React, accessibility)

#### Creating a Task
1. **Plan**: Draft a task description in `.dwp/drafts/` or a conversation
2. **Validate**: `npm run lint && npm test && npm run build`
3. **Commit**: Conventional commit to a feature branch
4. **Review**: Create PR, confirm all gates pass

#### Debugging
- **Type errors**: `npm run lint` gives full report
- **Test failures**: `npm test` runs with tsx, check `src/tests/board.test.ts`
- **Runtime issues**: `npm run dev` starts Vite on port 3000 with hot reload
- **Firebase**: See `docs/SECURITY.md` — ensure auth providers and domains configured in Firebase Console

---

## 📚 Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| **`README.md`** | Product overview, schema, CSV format, Firebase setup | All |
| **`docs/PRODUCT_SPEC.md`** | Non-technical intent, feature list, user workflows | Product, AI agents |
| **`docs/ARCHITECTURE.md`** | Module graph, data flow, state management, Firebase integration | Developers, AI agents |
| **`docs/STANDARDS.md`** | TypeScript patterns, React best practices, accessibility, testing style | Developers, AI agents |
| **`docs/TESTING_GUIDE.md`** | Test framework (tsx), patterns, coverage expectations | Developers, AI agents |
| **`docs/DEVELOPMENT_COMMANDS.md`** | All runnable commands, Vite config, build optimization | Developers |
| **`docs/SECURITY.md`** | Auth setup, Firestore rules, secrets, domain config | Developers, DevOps |
| **`docs/AI_AGENT_ONBOARDING.md`** | Stack overview, common patterns, repository layout for agents | AI agents |
| **`docs/AI_AGENT_COLLAB.md`** | How to pair with agents, feedback patterns, issue tracking | All |
| **`docs/PERFORMANCE.md`** | Vite optimizations, lazy loading, memoization, bundle analysis | Developers |

Per-module READMEs:
- `src/app/README.md` (existing) — App shell and providers
- `src/data/README.md` (existing) — Seed data and fixtures
- *Add more as modules grow*

---

## 🔗 Related Files

- **`.agents/`** — Skill and agent catalog, commands registry
- **`.dwp/`** — Deep Work Plans (drafts, completed plans, task tracking)
- **`.env.example`** — Required environment variables template
- **`firestore.rules`** — Firestore security rules
- **`firebase-blueprint.json`** — Firestore schema definition

---

## 🚀 Getting Started with an Agent

### First-time setup
```bash
git clone https://github.com/agattone96/izzy-independance.git
cd izzy-independance
npm install
npm run dev  # Starts on http://localhost:3000
```

### Verify everything works
```bash
npm run lint   # TypeScript check
npm test       # Run unit tests
npm run build  # Production build
```

### Make a change
1. Create a branch: `git checkout -b feat/your-feature-name`
2. Edit code (TypeScript, React, etc.)
3. Validate: `npm run lint && npm test && npm run build`
4. Commit: `git add . && git commit -m "feat(scope): description"`
5. Push and open a PR

---

## 📖 Deep Work Plan Methodology

This repository is structured for AI agents to plan and execute work using the Deep Work Plan (DWP) methodology:

- **Spec-driven**: Work begins from a written specification, not ad-hoc prompts
- **Structured plans**: Tasks are decomposed, validated, and tracked
- **Verifiable**: Each task has clear success criteria and gates
- **Non-destructive**: Work is incrementally committed and reviewable

See `https://deepworkplan.com` for the full methodology.

---

## 🤝 Questions?

- **Product questions**: See `docs/PRODUCT_SPEC.md`
- **Architecture questions**: See `docs/ARCHITECTURE.md`
- **How to test**: See `docs/TESTING_GUIDE.md`
- **Code style**: See `docs/STANDARDS.md`
- **Security**: See `docs/SECURITY.md`
- **Agent collaboration**: See `docs/AI_AGENT_COLLAB.md`
