# Component Contracts: Mafia Game Landing Page

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

Component interface contracts define the public API of each component — props, slots, and expected behavior. These serve as the implementation spec for the tasks phase.

---

## SiteHeader

Shared component. Renders the top navigation bar.

```ts
// No props — self-contained. Reads nav items from internal constant.
function SiteHeader(): JSX.Element
```

**Contract**:

- Renders logo/game name (text, no image dependency) on the left
- Renders nav links (How to Play, Mechanics) with `.nav-link` class and smooth-scroll anchor behavior
- Renders a small CTA button (shadcn `Button`, `variant="default"`) on the right
- Sticky on scroll via `sticky top-0` with `backdrop-blur` background
- `aria-label="Main navigation"` on `<nav>`

---

## HeroSection

Landing feature component. The first thing visitors see.

```ts
interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaLabel: string
  ctaHref: string // '#join' anchor or external waitlist URL
}

function HeroSection(props: HeroSectionProps): JSX.Element
```

**Contract**:

- `headline` rendered as `<h1>` with `.display-title` class, large responsive type
- `subheadline` rendered as `<p>` below headline
- CTA rendered as shadcn `Button`, `size="lg"`, styled with lagoon brand color
- Section occupies minimum viewport height (`min-h-[90vh]`) with centered content
- Scroll indicator (subtle animated chevron) at bottom to signal more content below
- Content has `.rise-in` animation on mount

---

## HowToPlaySection

Landing feature component. Explains the game with role cards.

```ts
interface HowToPlaySectionProps {
  title: string
  description: string
  roles: GameRole[] // from data/roles.ts
}

function HowToPlaySection(props: HowToPlaySectionProps): JSX.Element
```

**Contract**:

- `title` rendered as `<h2>` with `.display-title`
- `description` as lead paragraph
- Each `GameRole` rendered as a card using shadcn `Card` with `.feature-card` class
- Card layout: icon (Lucide), role name (`CardTitle`), alignment badge (shadcn `Badge`), description, night action
- Cards in a responsive grid: 1 col mobile, 2 col tablet, 4 col desktop
- Section id: `how-to-play`

---

## GameMechanicsSection

Landing feature component. Explains day/night/voting cycle.

```ts
interface GameMechanicsSectionProps {
  title: string
  phases: GamePhase[] // from data/phases.ts
}

function GameMechanicsSection(props: GameMechanicsSectionProps): JSX.Element
```

**Contract**:

- `title` rendered as `<h2>` with `.display-title`
- Each `GamePhase` rendered as a step card showing: phase icon, order number, name, description, who acts
- Phases displayed in visual flow: connected cards showing Night → Day → Voting sequence
- Uses shadcn `Card` with `.island-shell` class
- Section id: `game-mechanics`

---

## CtaSection

Landing feature component. Bottom conversion section.

```ts
interface CtaSectionProps {
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}

function CtaSection(props: CtaSectionProps): JSX.Element
```

**Contract**:

- `title` rendered as `<h2>` with `.display-title`
- `description` as supporting text
- CTA rendered as shadcn `Button`, `size="lg"`, lagoon brand color
- Section has a dark background treatment (`.island-shell`) to contrast with page background
- Section id: `join`

---

## SiteFooter

Shared component. Renders the page footer.

```ts
// No props — self-contained.
function SiteFooter(): JSX.Element
```

**Contract**:

- Renders game name and copyright
- Renders minimal links
- Uses `.site-footer` class
- `<footer>` element with `aria-label="Site footer"`
