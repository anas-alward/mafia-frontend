# Tasks: Mafia Game Landing Page

**Input**: Design documents from `specs/001-mafia-game-landing/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: Not requested in specification. Test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install shadcn UI primitives and create feature directory structure

- [x] T001 Install shadcn button component via `bun x shadcn@latest add button`
- [x] T002 [P] Install shadcn card component via `bun x shadcn@latest add card`
- [x] T003 [P] Install shadcn badge component via `bun x shadcn@latest add badge`
- [x] T004 Create feature directory structure: `src/features/landing/components/` and `src/features/landing/data/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data and components that all user story sections depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create GameRole type and role data in `src/features/landing/data/roles.ts` (Mafia, Townsperson, Detective, Doctor as defined in data-model.md)
- [x] T006 [P] Create GamePhase type and phase data in `src/features/landing/data/phases.ts` (Night, Day, Voting as defined in data-model.md)
- [x] T007 [P] Create SiteHeader component in `src/components/site-header.tsx` (per contracts/components.md — logo/name, nav links with `.nav-link`, small CTA button, sticky with backdrop-blur)
- [x] T008 [P] Create SiteFooter component in `src/components/site-footer.tsx` (per contracts/components.md — game name, copyright, minimal links, `.site-footer` class)
- [x] T009 ⚠️ Reopened — BUG-001: Update `src/routes/__root.tsx` — remove `className="dark"` from `<html>`, switch to light mode default. Keep page title "Mafia — Social Deduction Online" and meta description.

**Checkpoint**: Foundation ready — site header, footer, and game data available. User story sections can now be built.

---

## Phase 3: User Story 1 - Discover the Game (Priority: P1) 🎯 MVP

**Goal**: A visitor lands on the page and understands within 10 seconds that this is an online social deduction game, sees how it works, and feels intrigued.

**Independent Test**: Show the page to someone unfamiliar with Mafia. They should describe what the site offers in under 10 seconds without prompting.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create HeroSection component in `src/features/landing/components/hero-section.tsx` (per contracts/components.md — headline in `.display-title`, subheadline, scroll indicator chevron, `.rise-in` animation, `min-h-[90vh]`)
- [x] T011 [P] [US1] Create HowToPlaySection component in `src/features/landing/components/how-to-play-section.tsx` (per contracts/components.md — title, description, role cards grid using shadcn Card + Badge, Lucide icons, `.feature-card` class, id="how-to-play")
- [x] T012 [P] [US1] Create GameMechanicsSection component in `src/features/landing/components/game-mechanics-section.tsx` (per contracts/components.md — title, phase cards in Night→Day→Voting flow using shadcn Card, `.island-shell` class, id="game-mechanics")
- [x] T013 [US1] Compose landing page in `src/routes/index.tsx` — import and render SiteHeader, HeroSection, HowToPlaySection, GameMechanicsSection, SiteFooter with `.page-wrap` container. Keep route thin (composition only, no business logic).

**Checkpoint**: Page renders hero, role explanation, and game mechanics. A first-time visitor understands the game concept.

---

## Phase 4: User Story 2 - Call to Action (Priority: P2)

**Goal**: An interested visitor sees a clear CTA and can take the next step (register interest for upcoming launch).

**Independent Test**: Verify the primary CTA button is visible above the fold on all viewport sizes and clicking it scrolls to or links to the intended destination.

### Implementation for User Story 2

- [x] T014 ⚠️ Reopened — BUG-001: [US2] Update CTA buttons — replace lagoon/teal styling (`bg-[var(--lagoon)]`) with `bg-neutral-900 hover:bg-neutral-800` in `src/features/landing/components/hero-section.tsx`, `src/features/landing/components/cta-section.tsx`, and `src/components/site-header.tsx`.
- [x] T015 [US2] Create CtaSection component in `src/features/landing/components/cta-section.tsx` (per contracts/components.md — title, description, shadcn Button CTA, `.island-shell` background, id="join")
- [x] T016 [US2] Integrate CtaSection into landing page route in `src/routes/index.tsx` — add between GameMechanicsSection and SiteFooter

**Checkpoint**: CTAs are functional and visible. Visitor can register interest. US1 content still intact and independently functional.

---

## Phase 5: User Story 3 - Visual & Brand Impression (Priority: P3)

**Goal**: The landing page conveys a premium, gamified aesthetic. Animations are smooth, responsive layout is seamless, and accessibility preferences are respected.

**Independent Test**: Visual review against contracts/components.md — hover states work, scroll reveals animate, layout adapts across 320px–2560px, animations respect `prefers-reduced-motion`.

### Implementation for User Story 3

- [x] T017 [US3] Add scroll-triggered section reveal animations in `src/styles.css` — define `@keyframes section-reveal` and apply via `animation-timeline: view()` with `motion-safe:` prefix
- [x] T018 ⚠️ Reopened — BUG-001: [P] [US3] Rework hover/active polish in `src/styles.css` — button glow using black/gray shadow instead of lagoon, card tilt using `shadow-md`, focus ring using neutral-900.
- [x] T019 [P] [US3] Add responsive refinements — verify `.page-wrap` max-width, ensure typography scales (Fraunces titles responsive sizing), ensure card grids collapse correctly on mobile
- [x] T020 [US3] Verify `prefers-reduced-motion` — add `motion-safe:` prefix to `.rise-in`, any new scroll animations, and hover transitions. Confirm content remains fully readable with motion disabled.
- [x] T021 ⚠️ Reopened — BUG-001: [US3] Accessibility re-verification in `src/styles.css` and all components — confirm color contrast with new light palette (black on white is excellent), verify focus ring visibility with neutral-900 color, check any remaining colored elements.

**Checkpoint**: Full visual polish applied. All three user stories complete and functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and optimization

- [x] T022 Run Lighthouse audit (performance ≥90, accessibility ≥95) — fix any issues found
- [x] T023 Execute quickstart.md validation checklist — all 10 items must pass
- [x] T024 Final responsive sweep — test at 320px, 768px, 1024px, 1440px, 2560px viewport widths for layout breakage

---

## Phase 7: Color Palette Rework (BUG-001)

**Purpose**: Switch from dark atmospheric color scheme to minimalist light palette per BUG-001. White backgrounds, black/dark gray actions.

- [x] T025 [P] Strip custom atmospheric CSS tokens from `src/styles.css` — remove `--lagoon`, `--sea-ink`, `--sea-ink-soft`, `--palm`, `--sand`, `--foam`, `--surface`, `--surface-strong`, `--line`, `--inset-glint`, `--kicker`, `--bg-base`, `--header-bg`, `--chip-bg`, `--chip-line`, `--link-bg-hover`, `--hero-a`, `--hero-b` and their `.dark` variants
- [x] T026 [P] Remove complex background gradients from `src/styles.css` — simplify `body` background to solid white, remove `body::before` and `body::after` pseudo-elements
- [x] T027 [P] Simplify utility classes in `src/styles.css` — keep `.page-wrap`, `.display-title`, `.island-kicker`, `.nav-link`, `.rise-in`, `.site-footer`. Simplify `.island-shell` and `.feature-card` to use white backgrounds with gray borders and subtle shadows instead of gradient surfaces
- [x] T028 Update all section components to use black/dark gray instead of lagoon/sea-ink colors — replace `text-[var(--sea-ink)]` with `text-neutral-900`, `text-[var(--sea-ink-soft)]` with `text-neutral-600`, `text-[var(--kicker)]` with `text-neutral-500`, `border-[var(--line)]` with `border-neutral-200`, `bg-[var(--header-bg)]` with `bg-white/90`, `text-[var(--lagoon)]` with `text-neutral-900`, `bg-[var(--lagoon)]/10` with `bg-neutral-100`
- [x] T029 [P] Update site footer — replace `text-[var(--sea-ink-soft)]` with `text-neutral-500`, `text-[var(--sea-ink)]` with `text-neutral-900`, `.site-footer` background to `bg-neutral-50 border-t border-neutral-200` in `src/components/site-footer.tsx`
- [x] T030 Remove `.dark` CSS variant block from `src/styles.css` (or comment out for potential future use) — the active palette is light-only

**Checkpoint**: Page renders with white background, black/dark gray actions, clean minimalist aesthetic.

**Bugfix**: 2026-06-26 — [BUG-001](../bugs/BUG-001.md) Added Phase 7 for color palette migration from dark atmospheric to light minimalist.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion. Can integrate with US1 components but independently testable (CTAs can be verified regardless of surrounding content).
- **User Story 3 (Phase 5)**: Depends on US1 + US2 completion (polishes existing content)
- **Polish (Phase 6)**: Depends on all user stories complete
- **Color Palette Rework (Phase 7)**: Depends on Phase 6 completion — reworks existing visual output for BUG-001 fix

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — can start after Foundational
- **US2 (P2)**: No hard dependency on US1 — CTA components are independent. Minor integration when adding CTA to HeroSection (T014) if HeroSection already has CTA infrastructure.
- **US3 (P3)**: Depends on US1 + US2 — polishes the complete page

### Within Each User Story

- Data files must exist before components that consume them (Foundational phase)
- Components created before route composition (T010–T012 before T013)
- Polish applied after all content is in place (US3 after US1+US2)

### Parallel Opportunities

- T001, T002, T003 (shadcn installs) — can run in any order, same file area but different commands
- T005, T006 (data files) — completely independent files
- T007, T008 (header, footer) — completely independent files
- T010, T011, T012 (US1 sections) — all independent component files, can be built simultaneously
- T017, T018, T019 (US3 polish) — different CSS rules/files, can be developed in parallel

---

## Parallel Example: User Story 1

```bash
# All three US1 sections can be built simultaneously (different files):
Task: "Create HeroSection in src/features/landing/components/hero-section.tsx"
Task: "Create HowToPlaySection in src/features/landing/components/how-to-play-section.tsx"
Task: "Create GameMechanicsSection in src/features/landing/components/game-mechanics-section.tsx"

# After all three complete:
Task: "Compose landing page route in src/routes/index.tsx"
```

## Parallel Example: Foundational Phase

```bash
# All foundational tasks can run in parallel (different files):
Task: "Create GameRole data in src/features/landing/data/roles.ts"
Task: "Create GamePhase data in src/features/landing/data/phases.ts"
Task: "Create SiteHeader in src/components/site-header.tsx"
Task: "Create SiteFooter in src/components/site-footer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (shadcn components, directories)
2. Complete Phase 2: Foundational (data files, header, footer, root config)
3. Complete Phase 3: User Story 1 (hero, how-to-play, game mechanics, route)
4. **STOP and VALIDATE**: Page renders with game explanation. Visitor understands Mafia in under 10 seconds.
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Hero + game explanation → Deploy/Demo (MVP!)
3. Add US2 → CTAs + waitlist → Deploy/Demo
4. Add US3 → Animations + polish + a11y → Deploy/Demo
5. Each story adds value without breaking previous stories

### Single Developer Strategy

Follow phases in order: 1 → 2 → 3 → 4 → 5 → 6. Each phase checkpoint validates the increment works before proceeding.
