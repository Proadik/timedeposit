module timedeposit::timedeposit;

use std::string::{String};
use sui::clock::Clock;
use sui::coin::{Self,Coin};
use sui::balance::{Self,Balance};

const IncorrectDate: u64 = 0;
const NotYetAvailable: u64 = 1;
const NotOwner: u64 = 2;

public struct TimeDeposit<phantom T> has key, store {
  id: UID,
  title: String,
  owner: address,
  amount: u64,
  release_date: u64,
  available_wallet: address,
  token: Balance<T>,
}

public struct DepositReceipt has key, store {
  id: UID,
  deposit_id: address,
  title: String,
  owner: address,
  amount: u64,
  release_date: u64,
  available_wallet: address,
}

public fun create_deposit<T>(
  owner: address,
  title: String,
  token: Coin<T>,
  release_date: u64,
  available_wallet: address,
  clock: &Clock,
  ctx: &mut TxContext,
) {
  assert!(clock.timestamp_ms() < release_date, IncorrectDate);
  let amount = token.value();
  let token_balance = coin::into_balance(token);
  let deposit = TimeDeposit<T> {
    id: object::new(ctx),
    owner,
    title,
    amount,
    release_date,
    available_wallet,
    token: token_balance
  };

  // Get the object ID of the TimeDeposit (for linking in the receipt)
  let deposit_id = object::uid_to_address(&deposit.id);

  // Create the DepositReceipt object with the same metadata
  let receipt = DepositReceipt {
    id: object::new(ctx),
    deposit_id,
    title,
    owner,
    amount,
    release_date,
    available_wallet,
  };

  transfer::share_object(deposit);
  transfer::transfer(receipt, owner);
}

public fun get_deposit_details<T>(deposit: &TimeDeposit<T>): (String, address, u64, u64, address) {
  (
    deposit.title,
    deposit.owner,
    balance::value(&deposit.token), // Get the token amount from Balance<T>
    deposit.release_date,
    deposit.available_wallet
  )
}

public fun withdraw<T>(
  deposit: TimeDeposit<T>,
  receipt: DepositReceipt,
  clock: &Clock,
  ctx: &mut TxContext,
) {
  // Ensure only the owner can withdraw
  let sender = tx_context::sender(ctx);
  assert!(deposit.owner == sender, NotOwner);

  // Ensure the release date has passed
  assert!(clock.timestamp_ms() >= deposit.release_date, NotYetAvailable);

  assert!(object::uid_to_address(&deposit.id) == receipt.deposit_id, NotOwner);

  let DepositReceipt {
    id: receipt_id,
    deposit_id: _,
    title: _,
    owner: _,
    amount: _,
    release_date: _,
    available_wallet: _,
  } = receipt;

  object::delete(receipt_id);

  let TimeDeposit {
    id,
    title: _,
    owner: _,
    amount: _,
    release_date: _,
    available_wallet,
    token,
  } = deposit;

  object::delete(id);
  let token_coin = coin::from_balance(token, ctx);
  transfer::public_transfer(token_coin, available_wallet);
}