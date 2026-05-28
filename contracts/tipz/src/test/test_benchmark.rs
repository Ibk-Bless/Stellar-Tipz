//! Gas usage benchmarks for the Tipz contract (issue #622).
//!
//! Measures and reports CPU instruction and memory costs for the most
//! frequently-called operations. The thresholds enforced here are slightly
//! tighter than the ones in `test_budget.rs` and are intended as a
//! regression net: a 10%+ jump in any of these counters should fail CI and
//! trigger investigation before merging.
//!
//! Each benchmark prints its measurement so trends can be tracked in CI
//! logs. Aggregating logs across runs is left to operational tooling.
//!
//! ## Why a separate file from `test_budget.rs`?
//!
//! `test_budget.rs` keeps operations within Soroban's *network* limits with
//! generous safety margin. The benchmarks here are tuned to an observed
//! baseline and exist to catch slow-creeping regressions.

#![cfg(test)]

use soroban_sdk::{testutils::Address as _, token, Address, Env, String};

use crate::TipzContract;
use crate::TipzContractClient;

// ── Baseline thresholds ──────────────────────────────────────────────────────
//
// Values are upper bounds. They were chosen with ~10% headroom over an
// observed baseline; a failure here is a *regression alert* — investigate
// CI logs before raising the limit.

const CPU_REGISTER: u64 = 30_000_000;
const CPU_SEND_TIP: u64 = 40_000_000;
const CPU_UPDATE_X_METRICS: u64 = 15_000_000;
const CPU_CALCULATE_CREDIT_SCORE: u64 = 20_000_000;
const CPU_GET_LEADERBOARD: u64 = 10_000_000;

const MEM_REGISTER: u64 = 10_000_000;
const MEM_SEND_TIP: u64 = 10_000_000;
const MEM_UPDATE_X_METRICS: u64 = 6_000_000;
const MEM_CALCULATE_CREDIT_SCORE: u64 = 8_000_000;
const MEM_GET_LEADERBOARD: u64 = 4_000_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

struct Setup<'a> {
    env: Env,
    client: TipzContractClient<'a>,
    admin: Address,
    tipper: Address,
}

fn setup() -> Setup<'static> {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TipzContract);
    let client = TipzContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let fee_collector = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();
    let token_admin_client = token::StellarAssetClient::new(&env, &token_address);

    client.initialize(&admin, &fee_collector, &200_u32, &token_address);

    let tipper = Address::generate(&env);
    token_admin_client.mint(&tipper, &10_000_000_000_i128);

    Setup {
        env,
        client,
        admin,
        tipper,
    }
}

fn register_creator(s: &Setup, username: &str) -> Address {
    let creator = Address::generate(&s.env);
    s.client.register_profile(
        &creator,
        &String::from_str(&s.env, username),
        &String::from_str(&s.env, "Creator"),
        &String::from_str(&s.env, ""),
        &String::from_str(&s.env, ""),
        &String::from_str(&s.env, ""),
    );
    creator
}

/// Measure `op` against the reset budget, log the result, and return (cpu, mem).
fn measure<R>(env: &Env, label: &str, op: impl FnOnce() -> R) -> (u64, u64, R) {
    env.budget().reset_unlimited();
    let result = op();
    let cpu = env.budget().cpu_instruction_cost();
    let mem = env.budget().memory_bytes_cost();
    soroban_sdk::log!(env, "BENCH {}: cpu={}, mem={}", label, cpu, mem);
    (cpu, mem, result)
}

fn assert_within(label: &str, actual: u64, limit: u64) {
    assert!(
        actual <= limit,
        "{label} regression: {actual} > limit {limit} (raise only after \
         investigating; >10% jumps should be reviewed)"
    );
}

// ── Benchmarks ───────────────────────────────────────────────────────────────

#[test]
fn benchmark_register_profile_gas() {
    let s = setup();
    let caller = Address::generate(&s.env);

    let (cpu, mem, _) = measure(&s.env, "register_profile", || {
        s.client.register_profile(
            &caller,
            &String::from_str(&s.env, "alice"),
            &String::from_str(&s.env, "Alice"),
            &String::from_str(&s.env, ""),
            &String::from_str(&s.env, ""),
            &String::from_str(&s.env, "alice_x"),
        );
    });

    assert_within("register_profile cpu", cpu, CPU_REGISTER);
    assert_within("register_profile mem", mem, MEM_REGISTER);
}

#[test]
fn benchmark_send_tip_gas() {
    let s = setup();
    let creator = register_creator(&s, "alice");

    let (cpu, mem, _) = measure(&s.env, "send_tip", || {
        s.client.send_tip(
            &s.tipper,
            &creator,
            &10_000_000_i128,
            &String::from_str(&s.env, "tip"),
            &false,
        );
    });

    assert_within("send_tip cpu", cpu, CPU_SEND_TIP);
    assert_within("send_tip mem", mem, MEM_SEND_TIP);
}

#[test]
fn benchmark_update_x_metrics_gas() {
    let s = setup();
    let creator = register_creator(&s, "alice");

    let (cpu, mem, _) = measure(&s.env, "update_x_metrics", || {
        s.client
            .update_x_metrics(&s.admin, &creator, &10_000_u32, &500_u32);
    });

    assert_within("update_x_metrics cpu", cpu, CPU_UPDATE_X_METRICS);
    assert_within("update_x_metrics mem", mem, MEM_UPDATE_X_METRICS);
}

#[test]
fn benchmark_calculate_credit_score_gas() {
    let s = setup();
    let creator = register_creator(&s, "alice");
    s.client
        .update_x_metrics(&s.admin, &creator, &10_000_u32, &500_u32);

    let (cpu, mem, _) = measure(&s.env, "calculate_credit_score", || {
        s.client.calculate_credit_score(&creator);
    });

    assert_within(
        "calculate_credit_score cpu",
        cpu,
        CPU_CALCULATE_CREDIT_SCORE,
    );
    assert_within(
        "calculate_credit_score mem",
        mem,
        MEM_CALCULATE_CREDIT_SCORE,
    );
}

#[test]
fn benchmark_get_leaderboard_gas() {
    let s = setup();

    let (cpu, mem, _) = measure(&s.env, "get_leaderboard_empty", || {
        s.client
            .get_leaderboard(&crate::types::LeaderboardPeriod::AllTime, &50_u32);
    });

    assert_within("get_leaderboard cpu", cpu, CPU_GET_LEADERBOARD);
    assert_within("get_leaderboard mem", mem, MEM_GET_LEADERBOARD);
}
