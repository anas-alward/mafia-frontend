# Implementation Plan: Mafia Game Landing Page

**Branch**: `001-mafia-game-landing` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-mafia-game-landing/spec.md`

## Summary

Build a single-page landing page for the Mafia online social deduction game. The page presents the game concept, explains mechanics, and drives visitor conversion via a call-to-action. It leverages the existing design system (atmospheric color palette, Fraunces+Manrope typography, utility classes) and composes the page from focused section components using shadcn/ui primitives where appropriate.

## Technical Context

**Language/Version**: TypeScript 6.0

**Primary Dependencies**: React 19, TanStack Start (router + SSR), TailwindCSS 4, shadcn/ui (new-york), Lucide React, class-variance-authority

**Storage**: N/A — all content is static (game role descriptions, phase explanations). No database or API needed.

**Testing**: Vitest 4, @testing-library/react, jsdom

**Target Platform**: Browser (modern evergreen — Chrome, Firefox, Safari, Edge latest 2 versions). Deployed via Cloudflare Workers (Wrangler).

**Project Type**: Web application (TanStack Start SSR + client)

**Performance Goals**: Lighthouse performance score ≥90, page interactive <3s on broadband, 60fps animations

**Constraints**: WCAG AA contrast minimum, prefers-reduced-motion respected, responsive 320px–2560px, JS-disabled core content visible

**Scale/Scope**: Single landing page (~5 sections), static content, no auth, no API calls

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                               | Status | Notes                                                                                                       |
| --------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| I. Simplicity over Cleverness           | PASS   | Static content, no state management complexity. Simple component composition.                               |
| II. Explicit over Implicit              | PASS   | Section components explicitly composed in route. Design tokens explicit in CSS variables.                   |
| III. Readability over Brevity           | PASS   | Named section components (HeroSection, HowToPlaySection) self-document the page structure.                  |
| IV. Type Safety over Convenience        | PASS   | Game role/phase data typed with discriminated unions. No `any` usage.                                       |
| V. Server-First                         | PASS   | Landing page is static — server renders full content. No unnecessary client-side data fetching.             |
| VI. Composition over Inheritance        | PASS   | Page composed of focused section components. Each section has single responsibility.                        |
| VII. Convention over Configuration      | PASS   | Follows existing route structure (`src/routes/`), components in `src/features/landing/components/`.         |
| VIII. Performance is a Feature          | PASS   | Static content renders server-side. No unnecessary client JS. Animations via CSS only.                      |
| IX. Security is Never Optional          | PASS   | No user input on landing page. No secrets exposed. Static content only.                                     |
| X. Consistency over Personal Preference | PASS   | Reuses existing CSS utilities (`.island-shell`, `.feature-card`, `.display-title`, etc.) and design tokens. |

**Gate result: ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-mafia-game-landing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── components.md    # Component interface contracts
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── index.tsx                      # Landing page route (thin — composes sections)
├── features/
│   └── landing/
│       ├── components/
│       │   ├── hero-section.tsx        # Hero with headline, subheadline, primary CTA
│       │   ├── how-to-play-section.tsx # Game explanation with role cards
│       │   ├── game-mechanics-section.tsx # Night/day phase explanation
│       │   └── cta-section.tsx         # Bottom CTA / waitlist section
│       └── data/
│           ├── roles.ts               # Static role definitions (Mafia, Detective, etc.)
│           └── phases.ts              # Static phase definitions (Night, Day, Voting)
├── components/
│   ├── ui/                            # shadcn components (existing + new)
│   │   ├── button.tsx                 # [NEW] CTA buttons
│   │   ├── card.tsx                   # [NEW] Role/phase cards
│   │   └── badge.tsx                  # [NEW] Labels/chips
│   ├── site-header.tsx                # [NEW] Navigation header
│   └── site-footer.tsx                # [NEW] Site footer
├── styles.css                         # Design tokens & utility classes (existing)
└── lib/
    └── utils.ts                       # cn() utility (existing)
```

**Structure Decision**: Single web application layout. Landing page feature in `src/features/landing/` per constitution's feature module pattern. Reusable shared components (`site-header`, `site-footer`) in `src/components/`. shadcn primitives in `src/components/ui/`. Static data separated from components for easy content updates.

## Complexity Tracking

No violations to justify. All constitution checks passed.
