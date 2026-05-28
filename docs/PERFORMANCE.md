# Performance Baselines

This document tracks backend performance baselines for Soroban RPC operations used by Stellar Tipz.

## Scope

- Concurrent tip submissions (`sendTransaction`)
- Leaderboard reads (`getLedgerEntries`)
- Profile queries (`getLedgerEntries`)

## Load Test Script

Path: `scripts/load-test.js`

Tooling: [k6](https://k6.io/)

### Prerequisites

```bash
# macOS
brew install k6
```

Optional environment variables for realistic traffic:

- `RPC_URL`: Soroban RPC endpoint (defaults to `https://soroban-testnet.stellar.org`)
- `SIGNED_TIP_XDRS`: Comma-separated signed transaction XDRs for tip submission load
- `LEADERBOARD_KEY_XDR`: Ledger key XDR for leaderboard storage
- `PROFILE_KEY_XDR`: Ledger key XDR for profile storage

### Run

```bash
k6 run scripts/load-test.js
```

### Scenarios

- Tip submissions: `10`, `50`, and `100` concurrent users
- Leaderboard reads: ramp to `60` concurrent users
- Profile queries: ramp to `60` concurrent users

## Baseline Capture Template

Record one row per test run.

| Date (UTC) | Network | Scenario | VUs | p50 (ms) | p95 (ms) | Error Rate | Notes |
|---|---|---|---:|---:|---:|---:|---|
| _YYYY-MM-DD_ | testnet/mainnet | tip_submissions_10 | 10 | - | - | - | |
| _YYYY-MM-DD_ | testnet/mainnet | tip_submissions_50 | 50 | - | - | - | |
| _YYYY-MM-DD_ | testnet/mainnet | tip_submissions_100 | 100 | - | - | - | |
| _YYYY-MM-DD_ | testnet/mainnet | leaderboard_reads | 60 | - | - | - | |
| _YYYY-MM-DD_ | testnet/mainnet | profile_queries | 60 | - | - | - | |

## Bottleneck and Breaking Point Checklist

Capture findings from each run:

- RPC throughput saturation point
- Latency inflection point (where p95 grows rapidly)
- Error-type distribution (rate limits, validation failures, timeouts)
- Transaction queueing/finality lag for `sendTransaction`
- Any scenario where `http_req_failed` or `rpc_failures` exceeds 5%

## Initial Expectations

- `10` VUs: stable, low error rate
- `50` VUs: acceptable latency increase
- `100` VUs: likely to expose rate limits or queueing delays

Mark the first scenario that violates thresholds as the current breaking point.
