// ⚡ TREE-SHAKING OPTIMIZED: Using named imports from @stellar/stellar-sdk
// This enables Vite's tree-shaking to eliminate unused code during build.
// Only these specific symbols are bundled, reducing Stellar SDK from ~500KB to ~150-200KB.
import {
  Account,              // Transaction source account
  Address,              // Stellar address handling
  Contract,             // Soroban contract interaction
  Memo,                 // Transaction memo
  MemoType,             // Memo type definitions
  nativeToScVal,        // Convert JS values to Soroban format
  Operation,            // Transaction operations
  scValToNative,        // Convert Soroban values to JS
  SorobanRpc,           // Soroban RPC client
  TimeoutInfinite,      // Transaction timeout constant
  Transaction,          // Transaction wrapper
  TransactionBuilder,   // Builder pattern for transactions
  xdr,                  // XDR encoding/decoding
} from "@stellar/stellar-sdk";

import { NetworkDetails } from "../helpers/network";
import { stroopToXlm, mapContractResponse } from "../helpers/format";
import { ERRORS } from "../helpers/error";
import { buildContractCacheKey, contractQueryCache } from "./cache";

// Cache TTLs for read-only token metadata. Symbol/name/decimals are immutable
// for a given contract, so they can be cached aggressively. Balances change
// often, so they use a short TTL and are invalidated on writes.
const TOKEN_METADATA_TTL_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_BALANCE_TTL_MS = 5 * 1000; // 5 seconds

// TODO: once soroban supports estimated fees, we can fetch this
export const BASE_FEE = "100";
export const baseFeeXlm = stroopToXlm(BASE_FEE).toString();

export const SendTxStatus: {
  [index: string]: SorobanRpc.Api.SendTransactionStatus;
} = {
  Pending: "PENDING",
  Duplicate: "DUPLICATE",
  Retry: "TRY_AGAIN_LATER",
  Error: "ERROR",
};

export const XLM_DECIMALS = 7;

export const RPC_URLS: { [key: string]: string } = {
  TESTNET: "https://soroban-testnet.stellar.org/",
  PUBLIC: "https://soroban-rpc.mainnet.stellar.gateway.fm/",
};

// Can be used whenever you need an Address argument for a contract method
export const accountToScVal = (account: string) =>
  new Address(account).toScVal();

// Can be used whenever you need an i128 argument for a contract method
export const numberToI128 = (value: number | bigint): xdr.ScVal =>
  nativeToScVal(value, { type: "i128" });

// Get a server configured for a specific network
export const getServer = (networkDetails: NetworkDetails) => {
  // Check for environment variable override first
  const envRpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL;
  
  let rpcUrl: string;
  
  if (envRpcUrl) {
    rpcUrl = envRpcUrl;
    console.log(`Using RPC URL from environment: ${rpcUrl}`);
  } else {
    rpcUrl = RPC_URLS[networkDetails.network];
    
    if (!rpcUrl) {
      console.warn(
        `No RPC URL configured for network: ${networkDetails.network}. ` +
        `Available networks: ${Object.keys(RPC_URLS).join(", ")}. ` +
        `Set VITE_SOROBAN_RPC_URL environment variable to override.`
      );
      throw new Error(
        `RPC URL not found for network: ${networkDetails.network}. ` +
        `Please configure VITE_SOROBAN_RPC_URL or use a supported network.`
      );
    }
    
    console.log(`Using default RPC URL for ${networkDetails.network}: ${rpcUrl}`);
  }
  
  return new SorobanRpc.Server(rpcUrl, {
    allowHttp: networkDetails.networkUrl.startsWith("http://"),
  });
};

// Get a TransactionBuilder configured with our public key
export const getTxBuilder = async (
  pubKey: string,
  fee: string,
  server: SorobanRpc.Server,
  networkPassphrase: string,
) => {
  const source = await server.getAccount(pubKey);
  return new TransactionBuilder(source, {
    fee,
    networkPassphrase,
  });
};

/**
 * Build a TransactionBuilder for simulation-only (read-only) contract calls.
 *
 * Soroban simulation does not require the source account to exist on Horizon.
 * Using a minimal in-memory Account avoids 404s when no wallet is connected.
 */
export const getSimulationTxBuilder = (
  pubKey: string,
  fee: string,
  networkPassphrase: string,
) => {
  const source = new Account(pubKey, "0");
  return new TransactionBuilder(source, { fee, networkPassphrase });
};

//  Can be used whenever we need to perform a "read-only" operation
//  Used in getTokenSymbol, getTokenName, getTokenDecimals, and getTokenBalance
export const simulateTx = async <ArgType>(
  tx: Transaction<Memo<MemoType>, Operation[]>,
  server: SorobanRpc.Server,
): Promise<ArgType> => {
  const response = await server.simulateTransaction(tx);

  if (
    SorobanRpc.Api.isSimulationSuccess(response) &&
    response.result !== undefined
  ) {
    const raw = scValToNative(response.result.retval);
    return mapContractResponse<ArgType>(raw);
  }

  throw new Error("cannot simulate transaction");
};

// Build and submits a transaction to the Soroban RPC
// Polls for non-pending state, returns result after status is updated
export const submitTx = async (
  signedXDR: string,
  networkPassphrase: string,
  server: SorobanRpc.Server,
  timeoutSeconds: number = 60,
) => {
  const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase);

  const sendResponse = await server.sendTransaction(tx);

  if (sendResponse.errorResult) {
    throw new Error(ERRORS.UNABLE_TO_SUBMIT_TX);
  }

  if (sendResponse.status === SendTxStatus.Pending) {
    let txResponse = await server.getTransaction(sendResponse.hash);
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;

    while (
      txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
    ) {
      // Check if timeout exceeded
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(
          `Transaction polling timeout after ${timeoutSeconds} seconds. Hash: ${sendResponse.hash}`
        );
      }

      // See if the transaction is complete
      txResponse = await server.getTransaction(sendResponse.hash);
      // Wait a second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      // Any write invalidates the read cache — the only safe default is to
      // drop balance reads for both ends of the transaction. Callers that
      // know more (e.g. a profile update) can call additional prefix
      // invalidations themselves.
      contractQueryCache.invalidateByPrefix('["balance"');
      return txResponse.resultXdr.toXDR("base64");
    }
  }
  throw new Error(
    `Unable to submit transaction, status: ${sendResponse.status}`,
  );
};

// Get the tokens symbol, decoded as a string
export const getTokenSymbol = async (
  tokenId: string,
  txBuilder: TransactionBuilder,
  server: SorobanRpc.Server,
) => {
  return contractQueryCache.getOrFetch(
    buildContractCacheKey("symbol", tokenId),
    TOKEN_METADATA_TTL_MS,
    async () => {
      const contract = new Contract(tokenId);
      const tx = txBuilder
        .addOperation(contract.call("symbol"))
        .setTimeout(TimeoutInfinite)
        .build();
      return simulateTx<string>(tx, server);
    },
  );
};

// Get the tokens name, decoded as a string
export const getTokenName = async (
  tokenId: string,
  txBuilder: TransactionBuilder,
  server: SorobanRpc.Server,
) => {
  return contractQueryCache.getOrFetch(
    buildContractCacheKey("name", tokenId),
    TOKEN_METADATA_TTL_MS,
    async () => {
      const contract = new Contract(tokenId);
      const tx = txBuilder
        .addOperation(contract.call("name"))
        .setTimeout(TimeoutInfinite)
        .build();
      return simulateTx<string>(tx, server);
    },
  );
};

// Get the tokens decimals, decoded as a number
export const getTokenDecimals = async (
  tokenId: string,
  txBuilder: TransactionBuilder,
  server: SorobanRpc.Server,
) => {
  return contractQueryCache.getOrFetch(
    buildContractCacheKey("decimals", tokenId),
    TOKEN_METADATA_TTL_MS,
    async () => {
      const contract = new Contract(tokenId);
      const tx = txBuilder
        .addOperation(contract.call("decimals"))
        .setTimeout(TimeoutInfinite)
        .build();
      return simulateTx<number>(tx, server);
    },
  );
};

// Get the tokens balance, decoded as a string
export const getTokenBalance = async (
  address: string,
  tokenId: string,
  txBuilder: TransactionBuilder,
  server: SorobanRpc.Server,
) => {
  return contractQueryCache.getOrFetch(
    buildContractCacheKey("balance", tokenId, address),
    TOKEN_BALANCE_TTL_MS,
    async () => {
      const params = [accountToScVal(address)];
      const contract = new Contract(tokenId);
      const tx = txBuilder
        .addOperation(contract.call("balance", ...params))
        .setTimeout(TimeoutInfinite)
        .build();
      return simulateTx<string>(tx, server);
    },
  );
};

// Build a "transfer" operation, and prepare the corresponding XDR
// https://github.com/stellar/soroban-examples/blob/main/token/src/contract.rs#L27
export const makePayment = async (
  tokenId: string,
  amount: number,
  to: string,
  pubKey: string,
  memo: string,
  txBuilder: TransactionBuilder,
  server: SorobanRpc.Server,
) => {
  const contract = new Contract(tokenId);
  const tx = txBuilder
    .addOperation(
      contract.call(
        "transfer",
        ...[
          accountToScVal(pubKey), // from
          accountToScVal(to), // to
          numberToI128(amount), // amount
        ],
      ),
    )
    .setTimeout(TimeoutInfinite);

  if (memo.length > 0) {
    tx.addMemo(Memo.text(memo));
  }

  const preparedTransaction = await server.prepareTransaction(tx.build());

  return preparedTransaction.toXDR();
};

export const getEstimatedFee = async (
  tokenId: string,
  amount: number,
  to: string,
  pubKey: string,
  memo: string,
  txBuilder: TransactionBuilder,
  server: SorobanRpc.Server,
) => {
  const contract = new Contract(tokenId);
  const tx = txBuilder
    .addOperation(
      contract.call(
        "transfer",
        ...[
          accountToScVal(pubKey), // from
          accountToScVal(to), // to
          numberToI128(amount), // amount
        ],
      ),
    )
    .setTimeout(TimeoutInfinite);

  if (memo.length > 0) {
    tx.addMemo(Memo.text(memo));
  }

  const raw = tx.build();

  const simResponse = await server.simulateTransaction(raw);

  if (SorobanRpc.Api.isSimulationError(simResponse)) {
    throw simResponse.error;
  }

  // 'classic' tx fees are measured as the product of tx.fee * 'number of operations', In soroban contract tx,
  // there can only be single operation in the tx, so can make simplification
  // of total classic fees for the soroban transaction will be equal to incoming tx.fee + minResourceFee.
  const classicFeeNum = BigInt(raw.fee || "0");
  const minResourceFeeNum = BigInt(simResponse.minResourceFee || "0");
  const fee = (classicFeeNum + minResourceFeeNum).toString();
  return fee;
};
