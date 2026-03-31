#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    PaymentExpired = 1,
    AlreadySettled = 2,
    AlreadyRefunded = 3,
}

#[contracttype]
#[derive(Clone)]
pub struct Payment {
   pub seller: Address,
   pub buyer: Address,
   pub amount: i128,
   pub status: Symbol, // PENDING, SETTLED, REFUNDED
   pub expires_at: u64,
}

#[contract]
pub struct ProofPayContract;

#[contractimpl]
impl ProofPayContract {

   // Create a new payment (Buyer scans QR and initiates payment intent)
   pub fn create_payment(env: Env, order_id: Symbol, seller: Address, buyer: Address, amount: i128, valid_for_secs: u64) {
       buyer.require_auth();

       let now = env.ledger().timestamp();
       let payment = Payment {
           seller,
           buyer,
           amount,
           status: symbol_short!("PENDING"),
           expires_at: now + valid_for_secs,
       };

       env.storage().instance().set(&order_id, &payment);
   }

   // Get payment details (Seller polling checks this)
   pub fn get_payment(env: Env, order_id: Symbol) -> Payment {
       env.storage().instance().get(&order_id).unwrap()
   }

   // Confirm payment (GCash webhook simulated by Buyer hitting SETTLED)
   pub fn confirm_payment(env: Env, order_id: Symbol) -> Result<(), Error> {
       let mut payment: Payment = env.storage().instance().get(&order_id).unwrap();

       if payment.status == symbol_short!("SETTLED") {
           return Err(Error::AlreadySettled);
       }
       if payment.status == symbol_short!("REFUNDED") {
           return Err(Error::AlreadyRefunded);
       }

       if env.ledger().timestamp() > payment.expires_at {
           return Err(Error::PaymentExpired);
       }

       payment.buyer.require_auth();
       payment.status = symbol_short!("SETTLED");

       env.storage().instance().set(&order_id, &payment);
       Ok(())
   }

   // Cancel or Refund payment (Buyer or Seller decides to cancel an expired or disputed payment)
   pub fn refund_payment(env: Env, order_id: Symbol) -> Result<(), Error> {
       let mut payment: Payment = env.storage().instance().get(&order_id).unwrap();

       if payment.status == symbol_short!("SETTLED") {
           return Err(Error::AlreadySettled);
       }

       // For the hackathon demo, we let the buyer authorize the refund/cancellation of their intent
       payment.buyer.require_auth();
       payment.status = symbol_short!("REFUNDED");

       env.storage().instance().set(&order_id, &payment);
       Ok(())
   }
}
