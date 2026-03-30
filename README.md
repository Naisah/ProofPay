# ProofPay 💸

**A decentralized solution to instantly verify bank and e-wallet transfers via Stellar & Soroban.**

A small seller in Manila accepting bank or e-wallet transfers (e.g., GCash) cannot verify if a buyer’s payment is real or still pending. This forces reliance on screenshots, leading to frequent scams or delayed order fulfillment. 

**ProofPay solves this** by letting a buyer initiate a payment that logs an unchangeable transaction record with a `PENDING` status on the Stellar blockchain. This status automatically updates to `SETTLED` via a Soroban smart contract, allowing the seller to instantly verify authenticity and finality.

## Features & Technologies Used
- **Smart Contracts:** Rust-based Soroban contracts to handle state transitions (`WAITING` ➔ `PENDING` ➔ `SETTLED`).
- **Blockchain:** Stellar network for ultra-fast, low-cost verifiable transactions.
- **Frontend Stack:** React, Vite, and Vanilla CSS (Glassmorphism design).
- **Wallet Integration:** @stellar/freighter-api for direct browser signing.
- **QR Codes:** Seamless bridging between merchant portals and customer smartphones.

---

## 🛠️ Setup & Installation

Follow these steps to run ProofPay locally on your machine.

### Prerequisites
- Node.js (v18+)
- Rust & Cargo
- Stellar CLI & Soroban setup locally
- [Freighter Wallet](https://www.freighter.app/) extension installed in your browser.

### 1. Smart Contract Deployment (Optional)
If you want to deploy your own instance of the contract to the Stellar Testnet:
```bash
# Compile the contract to WebAssembly
stellar contract build

# Generate and fund a Testnet deployer key
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet

# Deploy the contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/proofpay.wasm --source deployer --network testnet
```
*(Note: Be sure to update the `contractId` inside `ui/src/stellar.ts` if you deploy your own instance).*

### 2. Frontend Application Setup
Navigate into the `ui` folder and install the dependencies:
```bash
cd ui
npm install
```

Start the local development server:
```bash
npm run dev
```
The app will launch at `http://localhost:5173`.

---

## 📖 Usage Guide (Hackathon Demo Flow)

To demonstrate ProofPay, we recommend opening two browser windows side-by-side to simulate the Seller (merchant tablet) and the Buyer (customer phone).

1. **Wallet Setup:** Ensure your Freighter Wallet is toggled to the **Test Net** and that your account is funded with test XLM (use the Faucet button inside the wallet).
2. **The Seller Side:** In window 1, navigate to the **Seller Portal**. Type in the amount for the item you are selling and generate the ProofPay QR code. The status will sit at `WAITING`.
3. **The Buyer Side:** In window 2, navigate to the **Buyer Portal**. Use the camera scanner to scan the QR code (or manually type the Order ID and Amount).
4. **Initiate Payment:** The buyer clicks "Send Payment". Freighter will pop up. Sign the transaction. Once confirmed on-chain, the Seller's screen will instantly update to `PENDING` (Yellow).
5. **Simulate GCash Settlement:** To demonstrate what happens when the money actually arrives at the bank/GCash account, the buyer clicks **Simulate GCash Receipt**. This sends the final `confirm_payment` transaction on-chain.
6. **Finality:** The Seller's screen turns Green (`SETTLED`), and the merchant hands over the goods securely—no screenshot needed!

---

## ⚙️ How It Works (Under the Hood)

ProofPay's architecture guarantees that a merchant never has to trust a screenshot again. 

Instead of printing a static GCash QR code for the cashier counter, the merchant generates a **dynamic ProofPay QR code** for every order. Scanning this code forces the payment intent through the Soroban contract before the actual funds move, anchoring the transaction to a decentralized source of truth. When the fiat payment finally clears (via webhooks or APIs in production), the smart contract permanently transitions the order state, guaranteeing the merchant that the funds are secured.