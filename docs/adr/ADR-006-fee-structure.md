# ADR-006: Fee structure design

- **Status:** Accepted
- **Date:** 2026-05-27
- **Deciders:** Core team
- **Implements:** `contracts/tipz/src/fees.rs`

## Context

The protocol takes a fee on creator **withdrawals** to fund operations. The fee
must be: configurable by the admin, bounded so it can never be set abusively
high, exact (no value created or destroyed), overflow-safe on a `i128` stroop
amount, and resistant to circumvention via dust withdrawals.

## Options considered

1. **Basis-points fee on withdrawal, with a hard cap and a 1-stroop minimum** —
   `fee = max(amount * bps / 10_000, 1)` for `bps > 0`, capped at 1000 bps
   (10%), `net = amount - fee`.
2. **Fee charged per tip (on deposit)** — spreads the cost, but taxes inbound
   generosity and complicates micro-tips; creators dislike "shrinkflation" on
   incoming tips.
3. **Flat per-transaction fee** — simple, but regressive for small withdrawals
   and arbitrary for large ones.

## Decision

Charge a **basis-points fee on withdrawal** (option 1), implemented in
`fees.rs::calculate_fee`:

- `fee_bps == 0` → no fee, `net == amount`.
- otherwise `fee = max((amount * fee_bps) / 10_000, 1)`, `net = amount - fee`.
- the admin-set `fee_bps` is bounded to **≤ 1000 bps (10%)**.
- all arithmetic uses `checked_mul` / `checked_sub`, returning
  `OverflowError` instead of panicking; the invariant `fee + net == amount`
  holds exactly.

## Rationale

- Charging on **withdrawal** keeps incoming tips whole (better creator UX) and
  centralises fee logic at one exit point.
- **Basis points** scale fairly with amount and are the industry-standard unit.
- The **1-stroop minimum** closes a real exploit: without it, integer division
  lets sub-`10_000/bps` withdrawals round the fee to 0 (see the worked example
  and `test_fee_minimum_enforcement` in `fees.rs`).
- The **10% cap** bounds admin power so a fee can never be set confiscatory.
- **Checked arithmetic** prevents overflow panics on adversarial amounts near
  `i128::MAX`.

## Consequences

- Positive: exact, bounded, overflow-safe, dust-resistant; creators keep full
  tips until they withdraw.
- Negative / cost: a 1-stroop minimum means tiny withdrawals are
  disproportionately taxed (negligible in practice); fee rounds in the
  protocol's favour by design.
- Revisit the cap or default bps if the protocol's cost structure changes.
