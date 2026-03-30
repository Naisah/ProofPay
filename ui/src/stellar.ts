import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import { Client, networks } from "proofpay";

const network = networks.testnet;

export const proofPayClient = new Client({
  ...network,
  rpcUrl: "https://soroban-testnet.stellar.org:443",
});

export async function checkFreighter(): Promise<boolean> {
  if (await isConnected()) {
    return true;
  }
  return false;
}

export async function connectWallet(): Promise<string | null> {
  const connected = await checkFreighter();
  if (!connected) {
    alert("Please install Freighter Wallet");
    return null;
  }
  
  try {
    await requestAccess();
    const result = await getAddress();
    return result.address;
  } catch (e) {
    console.error("Wallet connection denied", e);
    return null;
  }
}

export async function getPaymentStatus(orderId: string) {
  try {
    const tx = await proofPayClient.get_payment({ order_id: orderId });
    // Without signing, we can get simulation result directly for reads usually
    return tx.result;
  } catch (e) {
    // Contract throws if order not found
    return null;
  }
}

// For write operations, the simulation is done by the Client, then we sign and send
export async function createPayment(orderId: string, _buyerInfo: string, amount: bigint) {
  const address = await connectWallet();
  if (!address) throw new Error("Wallet not connected");

  // Call contract method (this simulates it and returns AssembledTransaction)
  const tx = await proofPayClient.create_payment(
    { order_id: orderId, buyer: address, amount },
    { publicKey: address }
  );
  
  // Sign using freighter and send to the network
  const result = await tx.signAndSend({
    signTransaction: async (xdr: string) => {
      const signedXdr = await signTransaction(xdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
      });
      return signedXdr;
    }
  });
  
  return result;
}

export async function confirmPayment(orderId: string) {
  const address = await connectWallet();
  if (!address) throw new Error("Wallet not connected");

  const tx = await proofPayClient.confirm_payment(
    { order_id: orderId },
    { publicKey: address }
  );
  
  const result = await tx.signAndSend({
    signTransaction: async (xdr: string) => {
      const signedXdr = await signTransaction(xdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
      });
      return signedXdr;
    }
  });

  return result;
}
