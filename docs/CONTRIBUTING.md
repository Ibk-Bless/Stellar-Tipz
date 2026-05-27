# Contributing to Stellar Tipz

Thank you for your interest in contributing to **Stellar Tipz**! This guide will walk you through the process from fork to merged PR.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Workflow](#workflow)
4. [Branch Naming](#branch-naming)
5. [Commit Messages](#commit-messages)
6. [Pull Request Process](#pull-request-process)
7. [Code Standards](#code-standards)
8. [Review Criteria](#review-criteria)

---

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Getting Started

1. **Fork** this repository to your GitHub account
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/stellar-tipz.git
   cd stellar-tipz
   ```
3. **Set upstream** remote:
   ```bash
   git remote add upstream https://github.com/akan_nigeria/stellar-tipz.git
   ```
4. Follow the [Setup Guide](./SETUP.md) to configure your local environment

---

## Architecture Overview

Stellar Tipz is a monorepo with two halves: a Soroban smart contract (the
source of truth) and a React frontend that reads/writes it over RPC.

```text
┌──────────────────────────────┐        ┌──────────────────────────────────┐
│  frontend-scaffold/          │        │  contracts/tipz/  (Soroban, Rust) │
│  React 18 + Vite             │        │                                   │
│  ├─ features/  (UI)          │        │  lib.rs        ← contract entry    │
│  ├─ Zustand store (ADR-005)  │  RPC   │  ├─ profile / tips / token         │
│  └─ contract bindings  ──────┼──────► │  ├─ credit.rs     (ADR-003)        │
│                              │ invoke │  ├─ leaderboard.rs                 │
│  Freighter wallet (signing)  │        │  ├─ fees.rs       (ADR-006)        │
└──────────────────────────────┘        │  ├─ admin.rs / multisig.rs         │
                                         │  └─ storage.rs    (ADR-004)        │
                                         │        │                          │
                                         │        ▼ instance/persistent/temp  │
                                         │   Soroban storage (TTL-managed)    │
                                         └──────────────────────────────────┘
```

- **Frontend** holds only light client state in a Zustand store; all durable
  state lives on-chain. Transactions are signed with the Freighter wallet.
- **Contract** is module-per-concern; `storage.rs` is the single gateway to
  on-chain state and its TTL discipline.

For the full picture see [`ARCHITECTURE.md`](../ARCHITECTURE.md) (directory
layout, module boundaries, data flow) and the decision records in
[`docs/adr/`](./adr/README.md).

---

## Workflow

We use a **fork-and-branch** workflow:

```
1. Fork repo → 2. Create branch → 3. Implement → 4. Test → 5. PR → 6. Review → 7. Merge
```

### Step-by-step

1. **Sync your fork** before starting new work:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b <branch-name>
   ```

3. **Implement** the changes described in the issue

4. **Test** your changes:
   - **Contract changes**: `cd contracts && cargo test`
   - **Frontend changes**: `cd frontend-scaffold && npm run build`

5. **Commit** with a clear message (see [Commit Messages](#commit-messages))

6. **Push** to your fork:
   ```bash
   git push origin <branch-name>
   ```

7. **Open a Pull Request** against `main` on the upstream repo

---

## Branch Naming

Use this convention:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<issue-number>-<short-description>` | `feat/12-send-tip-function` |
| Bug fix | `fix/<issue-number>-<short-description>` | `fix/25-withdraw-overflow` |
| Test | `test/<issue-number>-<short-description>` | `test/30-credit-score-tests` |
| Docs | `docs/<issue-number>-<short-description>` | `docs/5-contract-spec-update` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer: Closes #<issue-number>]
```

### Types

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `refactor` | Code restructuring (no feature/fix) |
| `ci` | CI/CD changes |
| `chore` | Maintenance tasks |

### Examples

```
feat(contract): implement send_tip function

- Validate tip amount > 0
- Transfer XLM from tipper to contract
- Update creator balance in storage
- Emit TipSent event

Closes #12
```

```
test(contract): add unit tests for credit score calculation

Closes #18
```

---

## Pull Request Process

### Before Submitting

- [ ] Code compiles without errors
- [ ] All existing tests pass
- [ ] New tests are written for new functionality
- [ ] Code follows project style guidelines
- [ ] Branch is up to date with `main`

### PR Description

Use the [PR template](../.github/PULL_REQUEST_TEMPLATE.md). Include:

1. **What** — What does this PR do?
2. **Why** — Link to the issue it resolves
3. **How** — Brief technical approach
4. **Testing** — How you verified it works
5. **Screenshots** (for frontend changes)

### Review Timeline

- PRs are reviewed within **48 hours**
- Address review feedback promptly
- Maintainer will merge once approved

---

## Code Standards

### Rust (Smart Contracts)

- **Format**: Run `cargo fmt` before committing
- **Lint**: `cargo clippy -- -D warnings` must pass with zero warnings
- **Tests**: Every public function must have tests
- **Documentation**: Add `///` doc comments to public functions and types
- **Error handling**: Use custom `ContractError` enum, never `panic!`

### TypeScript (Frontend)

- **Lint**: ESLint must pass (`npm run lint`)
- **Types**: No `any` types — use proper TypeScript types
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Absolute imports from `src/` using tsconfig paths

### General

- No hardcoded secrets or private keys
- No `console.log` in production code (use proper error handling)
- Keep functions focused and under 50 lines where possible

---

## Review Criteria

PRs are evaluated on:

| Criteria | Weight |
|----------|--------|
| **Correctness** — Does it solve the issue? | High |
| **Tests** — Are edge cases covered? | High |
| **Security** — No vulnerabilities introduced? | High |
| **Code quality** — Clean, readable, idiomatic? | Medium |
| **Performance** — No unnecessary computation? | Medium |
| **Documentation** — Clear comments where needed? | Low |

---

## Resources

**Project docs**
- [Setup Guide](./SETUP.md) — get running locally in < 30 minutes
- [Architecture](../ARCHITECTURE.md) and [ADRs](./adr/README.md) — how & why
- [Deployment Guide](./DEPLOYMENT.md), [Contract Spec](./CONTRACT_SPEC.md),
  [Credit Score](./CREDIT_SCORE.md), [Security](./SECURITY.md)

**External**
- [Soroban docs](https://developers.stellar.org/docs/build/smart-contracts/overview)
- [Soroban SDK (Rust) reference](https://docs.rs/soroban-sdk)
- [Stellar developer docs](https://developers.stellar.org/docs)
- [Freighter wallet](https://www.freighter.app/)
- [Rust book](https://doc.rust-lang.org/book/) · [Conventional Commits](https://www.conventionalcommits.org/)

---

## Questions?

- Open a [Discussion](https://github.com/akan_nigeria/stellar-tipz/discussions) for general questions
- Comment on the relevant issue for task-specific questions
- Tag `@akan_nigeria` for urgent matters

---

**Thank you for contributing to Stellar Tipz! Every contribution helps empower creators worldwide. 💫**
