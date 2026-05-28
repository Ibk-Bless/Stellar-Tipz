# ADR-002: Brutalist design system

- **Status:** Accepted
- **Date:** 2026-05-27
- **Deciders:** Core team / design

## Context

The frontend (`frontend-scaffold/`, React + Vite + SCSS) needed a coherent
visual language. Tipz is a crypto-native product aimed at creators; the team
wanted a distinctive, high-contrast identity that is fast to build, cheap to
ship, and accessible — rather than a generic component-library look.

A neo-brutalist system (heavy borders, hard shadows, flat high-contrast color
blocks, monospace accents, minimal gradients) was prototyped in
`src/index.scss` and the landing features (e.g. `CTASection`, `StatsSection`).

## Options considered

1. **Neo-brutalist, hand-rolled SCSS tokens** — strong, memorable identity;
   few dependencies; small CSS payload; flat colors make WCAG contrast easy to
   hit.
2. **A component library (MUI / Chakra / shadcn)** — faster to assemble stock
   UIs, but heavier bundles, a generic look, and theme-fighting to achieve a
   distinctive style.
3. **Tailwind-only utility styling** — flexible, but without a design system on
   top it pushes styling decisions into every component and risks drift.

## Decision

Adopt a **neo-brutalist design system** expressed as SCSS design tokens and a
small set of shared primitives, rather than pulling in a third-party component
library.

## Rationale

- The aesthetic is intentionally part of the brand; a stock library would
  dilute it.
- Flat, high-contrast color blocks make it straightforward to meet the
  accessibility bar the repo enforces via Lighthouse CI (see the repo's
  Lighthouse config and `fix-contrast.js`).
- Fewer UI dependencies keeps the bundle small — a tracked concern in the
  bundle-optimization docs.

## Consequences

- Positive: distinctive identity, small CSS footprint, accessibility-friendly,
  no component-library lock-in.
- Negative / cost: the team maintains its own primitives and tokens; less
  "free" breadth than a mature library; contributors must learn the system's
  conventions (documented in `docs/FRONTEND_GUIDE.md`).
- Revisit if the surface area grows enough that maintaining bespoke components
  outweighs the identity benefit.
