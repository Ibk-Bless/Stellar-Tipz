# ADR-004: Storage strategy (persistent / temporary / instance)

- **Status:** Accepted
- **Date:** 2026-05-27
- **Deciders:** Core team
- **Implements:** `contracts/tipz/src/storage.rs`

## Context

Soroban charges **rent** for stored state and expires entries via a **TTL**
(time-to-live in ledgers); reading an expired entry fails. It exposes three
storage tiers — `instance`, `persistent`, and `temporary` — with different cost
and lifetime semantics. Tipz stores data with very different lifetimes:
contract config, long-lived creator profiles, and high-volume short-lived tip
records. Putting everything in one tier would either overpay rent or risk
losing data we must keep.

## Options considered

1. **Tier data by lifetime** — config/counters in `instance`, durable
   per-creator data in `persistent`, ephemeral records in `temporary`, each
   with deliberate TTL bumping.
2. **Everything persistent** — simplest mental model, but pays durable rent for
   data that is only briefly relevant (tip records), and lets config TTL drift.
3. **Everything temporary** — cheapest, but risks profiles/leaderboards
   expiring and being unrecoverable.

## Decision

**Tier by data lifetime**, as implemented in `storage.rs`:

| Tier | Used for | TTL policy |
|------|----------|-----------|
| `instance()` | Admin, fee config, global counters | Bumped on each write (`extend_instance_ttl`, ~7→31 day window) |
| `persistent()` | `Profile`, username reverse-lookup, leaderboards | `bump_profile_ttl` extends profile **and** its username entry together to avoid TTL desync |
| `temporary()` | Individual tip records (`Tip(u32)`) | TTL set on write (`set_tip_ttl`, ~7 days) |

All access goes through helpers in `storage.rs` rather than raw storage calls.

## Rationale

- Matching tier to lifetime minimises rent: we don't pay durable rent for tip
  records that only need to survive a short window.
- Keeping profiles in `persistent` with explicit TTL bumps on access prevents
  active creators' data from expiring.
- Bumping a profile and its `UsernameToAddress` reverse-lookup **together**
  prevents a class of bug where one expires and the other doesn't, breaking
  username resolution.
- Centralising access in helpers keeps the TTL discipline in one place.

## Consequences

- Positive: lower rent, no TTL-desync bugs, clear single source of truth for
  keys and lifetimes.
- Negative / cost: contributors must route all storage through `storage.rs` and
  understand which tier a new key belongs to; temporary tip records can expire,
  so anything needing permanent history must be aggregated into persistent
  state first.
- Revisit TTL constants if ledger close time or rent pricing changes materially.
