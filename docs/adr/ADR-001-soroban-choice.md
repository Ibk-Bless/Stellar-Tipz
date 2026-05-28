# ADR-001: Choice of Soroban for smart contracts

- **Status:** Accepted
- **Date:** 2026-05-27
- **Deciders:** Core team

## Context

Stellar Tipz is a decentralized tipping product: creators register profiles,
receive tips in a native asset, accrue an on-chain credit score and streaks,
and appear on leaderboards. The core trust-sensitive logic (custody of tipped
funds, fee calculation, credit scoring, withdrawals) must run on-chain.

We needed a smart-contract platform that: (a) settles cheaply and quickly
enough for micro-tips, (b) has first-class fungible-token support, (c) lets us
write safety-critical money logic in a memory-safe language, and (d) fits the
team's existing Stellar/Rust experience.

## Options considered

1. **Soroban (Stellar smart contracts, Rust → Wasm)** — runs on the Stellar
   network the product already targets; native Stellar Asset Contract (SAC) for
   XLM/tokens; Rust safety + `checked_*` arithmetic; very low fees and ~5s
   ledgers; built-in storage TTL/rent model.
2. **EVM chain (Solidity)** — largest ecosystem and tooling, but a different
   chain from Stellar, higher/variable gas, and Solidity's footguns around
   arithmetic and reentrancy.
3. **Off-chain ledger with periodic settlement** — cheapest per-tip, but
   reintroduces a trusted custodian, defeating the decentralization goal.

## Decision

Build the contract on **Soroban**, written in Rust and compiled to Wasm, using
the native SAC for asset transfers.

## Rationale

- The product is already a Stellar app; staying on Stellar avoids bridging and
  a second asset story.
- Soroban's fee/latency profile suits micro-tipping where EVM gas would dwarf a
  small tip.
- Rust gives us memory safety and explicit overflow handling (see
  [ADR-006](./ADR-006-fee-structure.md) and `fees.rs`'s `checked_mul`/`checked_sub`),
  which matters for code that moves user funds.
- Soroban's storage tiers and TTL model map cleanly onto our data lifetimes
  (see [ADR-004](./ADR-004-storage-strategy.md)).

## Consequences

- Positive: one chain, cheap settlement, safe arithmetic, native tokens.
- Negative / cost: smaller ecosystem than EVM; must manage Soroban storage
  **rent/TTL** explicitly (handled in `storage.rs`); Wasm size matters
  (tracked via the repo's bundle/Wasm optimization docs).
- Revisit if the product needs cross-chain tipping or an asset only available
  on another network.
