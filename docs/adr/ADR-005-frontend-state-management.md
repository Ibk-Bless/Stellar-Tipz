# ADR-005: Frontend state management (Zustand)

- **Status:** Accepted
- **Date:** 2026-05-27
- **Deciders:** Frontend team
- **Implements:** `frontend-scaffold/` (`zustand` ^5)

## Context

The frontend (React 18 + Vite) needs to share a modest amount of cross-cutting
client state — connected wallet/account, network, and cached view models for
profiles and leaderboards — across feature areas. Most server-ish state comes
from the contract via RPC. We wanted state management that is light, has minimal
boilerplate, and does not bloat the bundle (a tracked metric in this repo).

## Options considered

1. **Zustand** — tiny (~1 KB), hook-based store, no provider tree, no
   action/reducer ceremony; selectors give cheap re-render control.
2. **Redux Toolkit** — powerful and ubiquitous, with great devtools, but more
   boilerplate (slices, store wiring, providers) and a larger footprint than
   this app's state warrants.
3. **React Context + useReducer only** — zero dependencies, but Context causes
   broad re-renders and becomes unwieldy as shared state grows.

## Decision

Use **Zustand** as the client state container.

## Rationale

- The app's shared state is small; Zustand covers it without the slice/provider
  overhead of Redux.
- Selector-based subscriptions avoid the whole-tree re-renders that plague
  Context for frequently-updated values (e.g. wallet status).
- Its tiny size aligns with the bundle-size discipline the repo enforces (see
  the bundle-optimization docs and Lighthouse CI).

## Consequences

- Positive: minimal boilerplate, small bundle, easy testing of plain stores.
- Negative / cost: less out-of-the-box tooling/middleware than Redux Toolkit;
  the team must keep store structure disciplined since Zustand imposes little.
- Revisit if global state grows complex enough (large normalized caches,
  time-travel debugging needs) to justify Redux Toolkit.
