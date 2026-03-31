#[cfg(test)]
mod tests {
    use crate::{ProofPayContract, ProofPayContractClient};
    use soroban_sdk::{testutils::Address as _, Address, Env, Symbol};

    #[test]
    fn test_happy_path() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ProofPayContract);
        let client = ProofPayContractClient::new(&env, &contract_id);

        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);
        let order_id = Symbol::short("ORD1");

        // mock the auth check
        env.mock_all_auths();

        // valid for 15 minutes
        client.create_payment(&order_id, &seller, &buyer, &1000, &900);
        let r = client.confirm_payment(&order_id);
    }
}
