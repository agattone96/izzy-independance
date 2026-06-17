# App Shell & Core Providers (`src/app/`)

This directory is the entry point for the application bootstrap and global configurations.

## Target Structure & Responsibilities

- **`App.tsx`**: App shell rendering the top-level Router tree, Providers, and global shell elements.
- **`providers/`**: Context and configuration wrappers (e.g. State Provider, Router Provider, Theme Provider).
- **`routes/`**: Route definitions, guard logic, and multi-role middleware-level interception wrappers.
