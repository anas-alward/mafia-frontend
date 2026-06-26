# Research: Mafia Game Landing Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## R1: shadcn Component Selection

**Decision**: Install only `button`, `card`, and `badge` from shadcn. Use existing CSS utilities for everything else.

**Rationale**:

- `button` — CTAs need consistent interactive states (hover, focus, active, disabled). shadcn button provides this with `cva` variants. The default variant maps to the primary action; `outline` and `ghost` variants cover secondary actions (header links, footer links).
- `card` — Role cards and phase explanation cards share the same container pattern (header, body, footer). shadcn card provides composable sub-components (`CardHeader`, `CardContent`, `CardFooter`) that avoid reinventing structure.
- `badge` — Small labels for role categories (e.g., "Town", "Mafia") need a consistent chip style.
- The existing `.island-shell` and `.feature-card` CSS classes already provide the visual styling (gradients, shadows, border treatments). shadcn components handle structure/semantics; the existing utility classes provide the atmosphere.
- Other shadcn components (accordion, dialog, sheet) are not needed — this is a single static landing page with no interactive overlays.

**Alternatives considered**:

- Build all components from scratch: Rejected — shadcn button variants alone save ~50 lines of `cva` configuration and ensure consistent focus ring behavior.
- Use more shadcn components (accordion for mechanics): Rejected — simpler to present all content visibly on a single scrollable page than hide it behind click-to-expand.

## R2: Design System Integration

**Decision**: Simplify to a minimalist light palette. Use shadcn zinc base tokens as the foundation. Strip custom atmospheric tokens (`--lagoon`, `--sea-ink`, `--palm`, `--sand`, etc.) and their associated gradients, replacing them with a clean black/white/gray palette.

**Rationale**:
- shadcn `new-york` style with zinc base color is already a strong minimalist foundation — white backgrounds, gray borders, black text.
- The original custom tokens (`--lagoon`, `--sea-ink`, etc.) were designed for a dark atmospheric aesthetic that conflicts with the user's request for a white/minimalist design (see BUG-001).
- CTA buttons: use black or dark gray (`bg-neutral-900`, `bg-black`) instead of teal (`--lagoon`).
- Cards and surfaces: use white backgrounds with subtle gray borders — shadcn's default card styling handles this cleanly.
- Typography: keep Fraunces (display) + Manrope (body) — the font pairing is excellent for a premium feel.
- Keep the `.page-wrap`, `.display-title`, `.island-kicker` utility classes — they're color-agnostic structural helpers.
- Remove or simplify: `.island-shell`, `.feature-card` complex gradients → simple white cards with `border` and subtle `shadow-sm`.

**Alternatives considered**:
- Keep custom tokens and remap to light values: Rejected — adds unnecessary indirection. Directly use shadcn zinc tokens for simplicity.
- Remove all custom CSS: Rejected — some utility classes (`.page-wrap`, `.display-title`) are still useful structural helpers.

**Bugfix**: 2026-06-26 — [BUG-001](../bugs/BUG-001.md) Simplified design system. Stripped dark atmospheric tokens in favor of minimalist shadcn zinc base.

## R3: Animation Strategy

**Decision**: CSS-only animations. No JavaScript animation libraries. Respect `prefers-reduced-motion` via a `motion-safe:` prefix on all animations.

**Rationale**:

- The existing `.rise-in` class already demonstrates this pattern. Extend with additional reveal animations for sections as they enter the viewport.
- Scroll-triggered animations: use CSS `@keyframes` with `animation-timeline: view()` (supported in all modern evergreen browsers) — zero JavaScript.
- For browsers that don't support scroll-driven animations, the content is still visible and readable without animation (progressive enhancement).
- `motion-safe:` Tailwind variant ensures all animations are disabled when the user has `prefers-reduced-motion: reduce` set.

**Alternatives considered**:

- Framer Motion: Rejected — adds a ~30kB dependency for animations achievable with CSS. Violates simplicity principle and the dep-minimization guidance.
- Intersection Observer + CSS classes: Rejected — `animation-timeline: view()` achieves the same without JavaScript for modern browsers. Fallback is static content (acceptable).

## R4: Light Mode Default (Minimalist)

**Decision**: Landing page defaults to light mode — white backgrounds, black/dark gray text and actions. No theme toggle. The design is clean and minimalist.

**Rationale**:

- The user explicitly requested a minimalist design with white background and black action colors. "Minimalist" in modern UI means light, clean, high-contrast (think Linear, Stripe, Notion).
- shadcn zinc base already provides a polished light palette: white `--background`, dark `--foreground`, gray `--muted` and `--border`.
- Remove `<html class="dark">` — default to light mode. The `.dark` CSS variant can remain for potential future use but is not active by default.
- No theme toggle needed — the brand identity is clean and minimal, not moody/dark.
- Remove or drastically simplify the complex radial gradient backgrounds in `styles.css` — they were designed for a dark atmospheric feel.

**Alternatives considered**:

- Dark mode: Rejected — contradicts user's explicit request for white background and minimalist aesthetic.
- Theme toggle: Rejected — adds complexity (state management, localStorage persistence, flash prevention) with no value for a minimalist brand.
- System preference (`prefers-color-scheme`): Rejected — the minimalist light brand is deliberate, not a user preference accommodation.

**Bugfix**: 2026-06-26 — [BUG-001](../bugs/BUG-001.md) Reversed from dark mode to light mode default. User wants white background, minimalist aesthetic.

## R5: Component Composition Pattern

**Decision**: Each landing section is an independent component composed in the route file. No shared state between sections. Content data lives in separate data files alongside the components.

**Rationale**:

- The route (`src/routes/index.tsx`) stays thin — it imports and arranges sections, nothing more.
- Each section component in `src/features/landing/components/` owns its markup and styling. Sections don't share state — no props drilling beyond one level.
- Static content data (`roles.ts`, `phases.ts`) is separated from component files so content can be edited without touching component logic. This also makes it easy to add i18n later by swapping data files.
- Header and footer are generic shared components (not landing-specific) so they live in `src/components/`.

**Alternatives considered**:

- Single monolithic `LandingPage` component: Rejected — violates single responsibility and the "no god components" constitution principle.
- Content in CMS/API: Rejected — overengineering for static content. A data file is trivially editable and requires no infrastructure.

## R6: Responsive Strategy

**Decision**: Mobile-first with Tailwind breakpoints. Single-column on mobile, two-column grid for role cards on tablet+, constrained max-width container.

**Rationale**:

- The existing `.page-wrap` class provides `width: min(1080px, calc(100% - 2rem))` — reuse this as the section container.
- Role cards: stack vertically on mobile (`flex-col`), 2-column grid on `md:` (`grid grid-cols-2`), 4-column on `lg:` for the main roles.
- Hero section: single column, centered text. CTA button full-width on mobile, intrinsic width on `sm:` and up.
- Typography: Fraunces display titles scale down proportionally on mobile (Tailwind responsive font sizes via `text-3xl md:text-5xl lg:text-6xl`).
- Footer: stack links vertically on mobile, row on tablet.
