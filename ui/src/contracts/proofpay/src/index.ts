import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CA3PLEVPIVLO2GCJDOA3M4GPR5MSGSENNQDGPH3JTVBVK27PKYDEZVFM",
  }
} as const

export const Errors = {
  1: {message:"PaymentExpired"},
  2: {message:"AlreadySettled"},
  3: {message:"AlreadyRefunded"}
}


export interface Payment {
  amount: i128;
  buyer: string;
  expires_at: u64;
  seller: string;
  status: string;
}

export interface Client {
  /**
   * Construct and simulate a get_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_payment: ({order_id}: {order_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Payment>>

  /**
   * Construct and simulate a create_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_payment: ({order_id, seller, buyer, amount, valid_for_secs}: {order_id: string, seller: string, buyer: string, amount: i128, valid_for_secs: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a refund_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  refund_payment: ({order_id}: {order_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a confirm_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  confirm_payment: ({order_id}: {order_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAAAAAAAAOUGF5bWVudEV4cGlyZWQAAAAAAAEAAAAAAAAADkFscmVhZHlTZXR0bGVkAAAAAAACAAAAAAAAAA9BbHJlYWR5UmVmdW5kZWQAAAAAAw==",
        "AAAAAQAAAAAAAAAAAAAAB1BheW1lbnQAAAAABQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVidXllcgAAAAAAABMAAAAAAAAACmV4cGlyZXNfYXQAAAAAAAYAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAAR",
        "AAAAAAAAAAAAAAALZ2V0X3BheW1lbnQAAAAAAQAAAAAAAAAIb3JkZXJfaWQAAAARAAAAAQAAB9AAAAAHUGF5bWVudAA=",
        "AAAAAAAAAAAAAAAOY3JlYXRlX3BheW1lbnQAAAAAAAUAAAAAAAAACG9yZGVyX2lkAAAAEQAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAVidXllcgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAOdmFsaWRfZm9yX3NlY3MAAAAAAAYAAAAA",
        "AAAAAAAAAAAAAAAOcmVmdW5kX3BheW1lbnQAAAAAAAEAAAAAAAAACG9yZGVyX2lkAAAAEQAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAPY29uZmlybV9wYXltZW50AAAAAAEAAAAAAAAACG9yZGVyX2lkAAAAEQAAAAEAAAPpAAAD7QAAAAAAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_payment: this.txFromJSON<Payment>,
        create_payment: this.txFromJSON<null>,
        refund_payment: this.txFromJSON<Result<void>>,
        confirm_payment: this.txFromJSON<Result<void>>
  }
}