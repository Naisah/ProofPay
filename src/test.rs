#[cfg(test)]
mod tests {
   use super::*;
   use soroban_sdk::{Env, Address, Symbol};

   #[test]
   fn test_happy_path() {
       let env = Env::default();
       let contract_id = env.register_contract(None, ProofPayContract);
       let client = ProofPayContractClient::new(&env, &contract_id);

       let buyer = Address::generate(&env);
       let order_id = Symbol::short("ORD1");

       client.create_payment(&order_id, &buyer, &1000);
       client.confirm_payment(&order_id);

       let payment = client.get_payment(&order_id);
       assert_eq!(payment.status, Symbol::short("SETTLED"));
   }

   #[test]
   #[should_panic]
   fn test_duplicate_order() {
       let env = Env::default();
       let contract_id = env.register_contract(None, ProofPayContract);
       let client = ProofPayContractClient::new(&env, &contract_id);

       let buyer = Address::generate(&env);
       let order_id = Symbol::short("ORD1");

       client.create_payment(&order_id, &buyer, &1000);
       client.create_payment(&order_id, &buyer, &1000); // should fail logically
   }

   #[test]
   fn test_state_storage() {
       let env = Env::default();
       let contract_id = env.register_contract(None, ProofPayContract);
       let client = ProofPayContractClient::new(&env, &contract_id);

       let buyer = Address::generate(&env);
       let order_id = Symbol::short("ORD2");

       client.create_payment(&order_id, &buyer, &500);

       let payment = client.get_payment(&order_id);
       assert_eq!(payment.amount, 500);
   }

   #[test]
   fn test_pending_status() {
       let env = Env::default();
       let contract_id = env.register_contract(None, ProofPayContract);
       let client = ProofPayContractClient::new(&env, &contract_id);

       let buyer = Address::generate(&env);
       let order_id = Symbol::short("ORD3");

       client.create_payment(&order_id, &buyer, &700);

       let payment = client.get_payment(&order_id);
       assert_eq!(payment.status, Symbol::short("PENDING"));
   }

   #[test]
   fn test_confirm_updates_status() {
       let env = Env::default();
       let contract_id = env.register_contract(None, ProofPayContract);
       let client = ProofPayContractClient::new(&env, &contract_id);

       let buyer = Address::generate(&env);
       let order_id = Symbol::short("ORD4");

       client.create_payment(&order_id, &buyer, &900);
       client.confirm_payment(&order_id);

       let payment = client.get_payment(&order_id);
       assert_eq!(payment.status, Symbol::short("SETTLED"));
   }
}
