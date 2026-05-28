//! Stellar Asset Contract (SAC) helpers for native XLM.
//!
//! The native XLM SAC address is stored at initialization (`NativeToken` in
//! instance storage). On-chain, this is the Stellar Asset Contract for XLM;
//! in tests, use [`Env::register_stellar_asset_contract_v2`] and pass the
//! resulting contract id into contract `initialize`.

use soroban_sdk::{token, Address, Env};

use crate::errors::ContractError;
use crate::storage;

/// Returns the Stellar Asset Contract address used for native XLM transfers.
///
/// This is the value set during contract initialization (see `NativeToken` storage).
#[inline]
pub fn native_token_address(env: &Env) -> Address {
    storage::get_native_token(env)
}

/// Transfer native XLM from `from` to `to` via the configured SAC.
///
/// Uses [`token::TokenClient`] (SEP-41). Returns [`ContractError::InsufficientBalance`]
/// when `from` holds less than `amount` (checked before invoking the token contract).
pub fn transfer_xlm(
    env: &Env,
    from: &Address,
    to: &Address,
    amount: i128,
) -> Result<(), ContractError> {
    let sac = native_token_address(env);
    transfer_xlm_with_token(env, &sac, from, to, amount)
}

pub fn transfer_xlm_with_token(
    env: &Env,
    sac: &Address,
    from: &Address,
    to: &Address,
    amount: i128,
) -> Result<(), ContractError> {
    if amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }

    let client = token::TokenClient::new(env, sac);

    if client.balance(from) < amount {
        return Err(ContractError::InsufficientBalance);
    }

    client.transfer(from, to, &amount);

    Ok(())
}
