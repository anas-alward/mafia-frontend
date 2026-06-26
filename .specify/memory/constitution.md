<!--
SYNC IMPACT REPORT
- Version change: N/A (template) → 1.0.0
- Modified principles: All 10 principles newly added (previously empty placeholders)
- Added sections:
    - Architecture & Engineering Standards
    - Development Workflow
    - Governance
- Removed sections: None (no content existed prior)
- Templates requiring updates:
    - ✅ .specify/templates/plan-template.md — Constitution Check references constitution file generically; no hardcoded values to update.
    - ✅ .specify/templates/spec-template.md — References constitution for scope/requirements alignment; content is generic.
    - ✅ .specify/templates/tasks-template.md — Task categorization driven by spec, not constitution-specific.
    - ✅ .specify/templates/checklist-template.md — Self-contained template, no constitution references to update.
    - ✅ .specify/extensions/agent-context/commands/speckit.agent-context.update.md — References agent context, not constitution values.
    - ✅ .specify/extensions/bugfix/commands/*.md — Generic bugfix workflow templates, no constitution-specific content.
- Follow-up TODOs: None
-->

# mafia-ui Constitution

This document defines the engineering standards for this project. Every contributor, whether human or AI, must follow these rules unless there is a documented reason not to.

---

## Core Principles

### I. Simplicity over Cleverness

Favor solutions that are straightforward and easy to reason about. Avoid overengineering, premature abstractions, and complex design patterns when a simpler approach suffices. The goal is to reduce cognitive overhead for the next developer.

### II. Explicit over Implicit

Prefer clarity and transparency. Code behavior should be obvious from reading it, not inferred from implicit rules or side effects. Configuration should be visible; magical defaults should be avoided.

### III. Readability over Brevity

Write code that is easy to read and understand. Avoid overly terse expressions, one-liners that obscure intent, or saving a few characters at the cost of clarity. Readable code is maintainable code.

### IV. Type Safety over Convenience

Never use `any`. Prefer `unknown` and narrow types properly. Export types separately, avoid duplicate types, and use discriminated unions when appropriate. Keep transport types separate from domain types.

### V. Server-First

Assume everything should run on the server first. Only move code to the client when necessary. Valid reasons include browser APIs, local interaction, animations, client-side state, and event handlers. Never use client components by default.

### VI. Composition over Inheritance

Build features by composing small, focused pieces rather than creating deep class hierarchies. Prefer composition for reusing behavior. Each module should have a single responsibility.

### VII. Convention over Configuration

Rely on established conventions to reduce boilerplate and decision fatigue. Follow project naming conventions, directory structures, and patterns unless there is a clear, documented reason to deviate.

### VIII. Performance is a Feature

Do not optimize prematurely. However, lazy-load large routes, virtualize large lists, memoize expensive computations, minimize unnecessary renders, and avoid unnecessary network requests. Measure before optimizing.

### IX. Security is Never Optional

Never trust client input. Never expose secrets, log passwords, or log tokens. Always validate input, sanitize data, and authorize every protected action. Authentication is not authorization.

### X. Consistency over Personal Preference

Follow the project's existing conventions even when they differ from personal style. Consistency across the codebase is more valuable than individual preferences. Write code for the next developer, not for yourself.

---

## Architecture & Engineering Standards

### Architecture

Every module should have a single responsibility.

Recommended structure:

```
app/
    routes/
    components/
    features/
    hooks/
    lib/
    server/
    styles/
    types/
```

Responsibilities:

- routes → routing, loaders, actions, page composition
- components → reusable UI components
- features → business logic and feature-specific code
- hooks → reusable React hooks
- server → server-only code
- lib → generic utilities
- types → shared types
- styles → styling

Do not place business logic inside reusable UI components.

### Dependency Rules

Dependencies should flow in one direction.

Allowed:

```
routes
    ↓
features
    ↓
lib

components
    ↓
lib

server
    ↓
lib
```

Never:

- lib importing features
- lib importing routes
- components importing routes
- utilities importing UI

Avoid circular dependencies.

### Route Rules

Route files should remain thin. A route should primarily contain parameter parsing, loaders, actions, and page composition. Business logic belongs inside feature modules or server modules.

**Bad:** Route contains database logic, business rules, validation, and formatting.

**Good:** Route validates input, calls a feature/service, and returns the result.

### Naming Conventions

Files: `user-card.tsx`, `product-table.tsx`, `auth.ts`, `date.ts`

Components: `UserCard`, `ProductTable`, `CheckoutForm`

Hooks: `useAuth`, `useDebounce`, `usePagination`

Utilities: `formatCurrency`, `calculateTax`, `parseDate`

Constants: `DEFAULT_PAGE_SIZE`, `MAX_UPLOAD_SIZE`, `API_TIMEOUT`

Names should describe intent, not implementation.

### Component Standards

Components should have one responsibility. Avoid large "God components." As a guideline: prefer under 200 lines, reconsider design around 300 lines, and split components that become difficult to understand. Prefer composition over deeply nested conditional rendering.

### State Management

Use the smallest possible scope. Priority order: URL State → Server State → Local State → Derived State.

Rules:

- Never duplicate state.
- Derive values instead of storing them.
- Keep state close to where it is used.
- Avoid unnecessary global state.

**Bad:**

```ts
const [user, setUser]
const [username, setUsername]
```

**Good:**

```ts
const username = user.name
```

### Server vs Client

Assume everything should run on the server first. Only move code to the client when necessary. Never use client components by default.

### Data Fetching

Each resource should have a single source of truth. Avoid fetching identical data multiple times. Fetch once and pass data down.

### Business Logic

Business rules should never live inside UI components. Keep domain logic reusable and testable.

### Validation

Never trust external input. Always validate route params, search params, request bodies, forms, and API responses. Prefer schema validation (e.g., Zod).

### TypeScript Standards

Never use `any`. Prefer `unknown`, then narrow types properly. Export types separately, avoid duplicate types, use discriminated unions when appropriate, and keep transport types separate from domain types.

### Error Handling

Never silently ignore errors. Never write `catch {}`. Instead: log appropriately, return meaningful errors, show user-friendly messages, and preserve debugging信息.

### API Layer

Separate transport models from domain models. Preferred flow: API → DTO → Mapper → Domain Model → UI. The UI should never depend directly on raw API responses.

### Styling

Use one styling approach consistently. Avoid mixing multiple styling systems without a documented reason. Keep styles predictable and reusable.

### Performance

Do not optimize prematurely. However: lazy-load large routes, virtualize large lists, memoize expensive computations, minimize unnecessary renders, and avoid unnecessary network requests. Measure before optimizing.

### Testing

Prioritize testing: business logic, complex hooks, critical components, and important routes. Avoid meaningless snapshot tests. Tests should verify behavior.

### Security

Never trust client input. Never expose secrets, log passwords, or log tokens. Never bypass authorization. Always validate input, sanitize data, and authorize every protected action.

### Dependencies

Before installing a package, ask: "Can we reasonably implement this ourselves in under 100 lines?" If yes, strongly consider avoiding the dependency. Every dependency adds maintenance cost, security risk, upgrade burden, and bundle size.

---

## Development Workflow

### Documentation

Comments should explain **why**, not **what**. Complex decisions should be documented.

**Bad:**

```ts
// increment counter
counter++
```

**Good:**

```ts
// Retry because the payment provider occasionally returns temporary failures.
```

### Git Standards

Keep pull requests focused. One PR should solve one problem. Use Conventional Commits (e.g., `feat(auth): add OAuth callback`, `fix(cart): prevent duplicate checkout`). Avoid unrelated changes in the same PR.

### Code Review Checklist

Before merging, verify:

- Does it solve one problem?
- Is the code easy to understand?
- Is there duplicate logic?
- Is naming clear?
- Are types correct?
- Are errors handled?
- Is validation complete?
- Is security considered?
- Is the code testable?
- Is dead code removed?
- Does it follow project architecture?

### AI Contributor Rules

AI-generated code must follow this constitution, match the existing architecture and naming conventions, avoid unnecessary abstractions and overengineering, avoid introducing unused dependencies, pass linting, pass formatting, pass type checking, be production-ready, and explain non-obvious algorithms with comments. AI should optimize for maintainability rather than cleverness.

### General Philosophy

Whenever multiple solutions exist, choose the one that is simpler, easier to maintain, easier to test, easier to explain, and more consistent with the existing codebase. Write code for the next developer, not for yourself. Every line of code is a maintenance cost. The best code is code that is obvious.

---

## Governance

This constitution supersedes all other practices. Amendments require documentation, approval, and a migration plan. All PRs and reviews must verify compliance. Complexity must be justified.

### Amendment Procedure

1. Propose amendments with rationale and impact analysis.
2. Amendments must be reviewed and approved before merging.
3. Update dependent templates (plan, spec, tasks, checklists) if principles or constraints change.
4. Increment the constitution version according to semantic versioning.

### Versioning Policy

- **MAJOR (X.0.0)**: Backward-incompatible governance changes, principle removals, or redefinitions.
- **MINOR (x.Y.0)**: New principles or sections added, or materially expanded guidance.
- **PATCH (x.y.Z)**: Clarifications, wording improvements, typo fixes, or non-semantic refinements.

### Compliance Review

All contributions are expected to follow this constitution. During code review, verify compliance with the principles and standards outlined above. Introduce checklist items for constitution alignment when relevant.

**Version**: 1.0.0 | **Ratified**: 2026-06-26 | **Last Amended**: 2026-06-26
