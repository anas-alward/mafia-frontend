# Quickstart: Mafia Game Landing Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Validation guide — how to run the landing page and verify it works end-to-end.

## Prerequisites

- Bun (or Node.js 20+)
- Project dependencies installed: `bun install`

## Run the dev server

```sh
bun run dev
# → Opens at http://localhost:3000
```

## What you should see

1. **Dark, atmospheric page** — dark background with subtle radial gradients, ocean/teal accent colors
2. **Sticky header** — game name on left, nav links (How to Play, Mechanics) center, CTA button right
3. **Hero section** — centered headline in Fraunces serif, subheadline, prominent CTA button
4. **How to Play section** — 4 role cards (Mafia, Townsperson, Detective, Doctor) in a grid with icons, alignment badges, and descriptions
5. **Game Mechanics section** — 3 connected phase cards (Night → Day → Voting)
6. **CTA section** — final call-to-action at the bottom
7. **Footer** — game name + copyright

## Verification checklist

| #   | Check                     | Expected                                                                 |
| --- | ------------------------- | ------------------------------------------------------------------------ |
| 1   | Page loads without errors | No console errors, content visible immediately                           |
| 2   | Above-the-fold CTA        | CTA button visible without scrolling on desktop and mobile               |
| 3   | Responsive layout         | Resize browser 320px → 2560px — no broken layouts, text remains readable |
| 4   | Keyboard navigation       | Tab through all interactive elements — focus ring visible on each        |
| 5   | prefers-reduced-motion    | Enable in OS settings — animations disabled, content still visible       |
| 6   | JS disabled               | Disable JavaScript in devtools — core content (text, CTAs) still renders |
| 7   | Lighthouse audit          | Run Lighthouse in Chrome — performance ≥90, accessibility ≥95            |
| 8   | Color contrast            | No contrast warnings in devtools for any text                            |
| 9   | Smooth scroll             | Click nav links — page scrolls smoothly to target section                |
| 10  | Dark mode                 | Page renders in dark theme by default (no light flash)                   |

## Run type checking

```sh
bun run check
# Equivalent to: prettier --check .
# (TypeScript type checking happens via the IDE / tsc --noEmit)
```

## Run linting

```sh
bun run lint
```

## Key files

| File                                                         | Purpose                                |
| ------------------------------------------------------------ | -------------------------------------- |
| `src/routes/index.tsx`                                       | Landing page route — composes sections |
| `src/features/landing/components/hero-section.tsx`           | Hero section                           |
| `src/features/landing/components/how-to-play-section.tsx`    | Role cards grid                        |
| `src/features/landing/components/game-mechanics-section.tsx` | Phase flow                             |
| `src/features/landing/components/cta-section.tsx`            | Bottom CTA                             |
| `src/features/landing/data/roles.ts`                         | Game role definitions                  |
| `src/features/landing/data/phases.ts`                        | Game phase definitions                 |
| `src/components/site-header.tsx`                             | Sticky nav header                      |
| `src/components/site-footer.tsx`                             | Page footer                            |
| `src/components/ui/button.tsx`                               | shadcn button                          |
| `src/components/ui/card.tsx`                                 | shadcn card                            |
| `src/components/ui/badge.tsx`                                | shadcn badge                           |
| `src/styles.css`                                             | Design tokens and utility classes      |
