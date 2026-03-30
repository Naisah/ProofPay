#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct Payment {
   pub buyer: Address,
   pub amount: i128,
   pub status: Symbol, // PENDING or SETTLED
}

#[contract]
pub struct ProofPayContract;

#[contractimpl]
impl ProofPayContract {

   // Create a new payment (Buyer initiates)
   pub fn create_payment(env: Env, order_id: Symbol, buyer: Address, amount: i128) {
       buyer.require_auth();

       let payment = Payment {
           buyer,
           amount,
           status: symbol_short!("PENDING"),
       };

       env.storage().instance().set(&order_id, &payment);
   }

   // Get payment details (Seller checks)
   pub fn get_payment(env: Env, order_id: Symbol) -> Payment {
       env.storage().instance().get(&order_id).unwrap()
   }

   // Confirm payment (Buyer simulates settlement)
   pub fn confirm_payment(env: Env, order_id: Symbol) {
       let mut payment: Payment = env.storage().instance().get(&order_id).unwrap();

       payment.buyer.require_auth();
       payment.status = symbol_short!("SETTLED");

       env.storage().instance().set(&order_id, &payment);
   }
}
