export const ERRORS = {
  UNSUPPORTED_NETWORK:
    "Unsupported network selected, please use Futurenet in Freighter",
  FREIGHTER_NOT_AVAILABLE: "Please install Freighter to connect your wallet",
  UNABLE_TO_SUBMIT_TX: "Unable to submit transaction",
  UNABLE_TO_SIGN_TX: "Unable to sign transaction",
  WALLET_CONNECTION_REJECTED: "Wallet connection rejected",
  NETWORK: "Unable to connect. Please check your internet connection.",
  CONTRACT: "Something went wrong. Please try again.",
  NOT_FOUND: "The requested content could not be found.",
  WALLET: "Wallet action failed. Please check your wallet and try again.",
  WALLET_NOT_INSTALLED:
    "Freighter extension not found. Please install Freighter to connect your wallet.",
  WALLET_LOCKED:
    "Freighter is locked. Please unlock your wallet and try again.",
  WALLET_REJECTED:
    "Connection was rejected. Please approve the connection request in your wallet.",
  WALLET_NETWORK_MISMATCH:
    "Network mismatch detected. Please switch your wallet to the correct network.",
  WALLET_TIMEOUT:
    "Connection timed out. Please try again and approve the connection in your wallet.",
};

export type ErrorCategory =
  | "network"
  | "contract"
  | "wallet"
  | "not-found"
  | "validation"
  | "timeout"
  | "rate-limited"
  | "unknown";

export type WalletErrorType =
  | "not-installed"
  | "locked"
  | "rejected"
  | "network-mismatch"
  | "timeout"
  | "unknown";

export const classifyWalletError = (
  error: unknown,
): { type: WalletErrorType; message: string } => {
  if (!error) return { type: "unknown", message: ERRORS.WALLET };

  const errorString = String(error).toLowerCase();

  if (
    errorString.includes("not installed") ||
    errorString.includes("extension not found") ||
    errorString.includes("freighter not available") ||
    errorString.includes("please install")
  ) {
    return { type: "not-installed", message: ERRORS.WALLET_NOT_INSTALLED };
  }

  if (
    errorString.includes("locked") ||
    errorString.includes("unlock")
  ) {
    return { type: "locked", message: ERRORS.WALLET_LOCKED };
  }

  if (
    errorString.includes("rejected") ||
    errorString.includes("cancelled") ||
    errorString.includes("canceled") ||
    errorString.includes("user declined") ||
    errorString.includes("user denied") ||
    errorString.includes("connection declined")
  ) {
    return { type: "rejected", message: ERRORS.WALLET_REJECTED };
  }

  if (
    errorString.includes("network") &&
    (errorString.includes("mismatch") ||
      errorString.includes("switch") ||
      errorString.includes("unsupported network"))
  ) {
    return {
      type: "network-mismatch",
      message: ERRORS.WALLET_NETWORK_MISMATCH,
    };
  }

  if (
    errorString.includes("timeout") ||
    errorString.includes("timed out") ||
    errorString.includes("popup closed")
  ) {
    return { type: "timeout", message: ERRORS.WALLET_TIMEOUT };
  }

  return { type: "unknown", message: ERRORS.WALLET };
};

export const categorizeError = (error: unknown): ErrorCategory => {
  if (!error) return "unknown";

  const errorString = String(error).toLowerCase();
  const rawMessage = error instanceof Error ? error.message : String(error);

  // Timeout
  if (
    errorString.includes("timeout") ||
    errorString.includes("timed out") ||
    errorString.includes("polling timeout")
  ) {
    return {
      category: "timeout",
      message: "The request timed out. Please try again.",
      retryable: true,
    };
  }

  // Network
  if (
    errorString.includes("failed to fetch") ||
    errorString.includes("networkerror") ||
    errorString.includes("network error") ||
    errorString.includes("net::err") ||
    errorString.includes("connection refused") ||
    errorString.includes("connection reset") ||
    (error instanceof TypeError && errorString.includes("fetch"))
  ) {
    return {
      category: "network",
      message: "Network error. Please check your connection.",
      retryable: true,
    };
  }

  // Not found
  if (
    errorString.includes("not found") ||
    errorString.includes("notfound") ||
    errorString.includes("404") ||
    errorString.includes("could not find")
  ) {
    return {
      category: "not-found",
      message: ERRORS.NOT_FOUND,
      retryable: false,
    };
  }

  // Wallet rejection / cancellation
  if (
    errorString.includes("user declined") ||
    errorString.includes("user rejected") ||
    errorString.includes("transaction rejected by user") ||
    errorString.includes("declined") ||
    errorString.includes("cancelled") ||
    errorString.includes("canceled") ||
    errorString.includes("denied") ||
    errorString.includes("closed modal") ||
    errorString.includes("freighter") ||
    errorString.includes("xbull") ||
    errorString.includes("albedo") ||
    errorString.includes("extension not found") ||
    errorString.includes("wallet")
  ) {
    return {
      category: "wallet",
      message: "Transaction was rejected by your wallet.",
      retryable: false,
    };
  }

  // Validation
  if (
    errorString.includes("invalid amount") ||
    errorString.includes("invalid username") ||
    errorString.includes("invalid address") ||
    errorString.includes("validation") ||
    errorString.includes("too long") ||
    errorString.includes("too short") ||
    errorString.includes("required field")
  ) {
    return {
      category: "validation",
      message: "Please check your input and try again.",
      retryable: false,
    };
  }

  // Rate limited
  if (
    errorString.includes("rate limit") ||
    errorString.includes("rate_limit") ||
    errorString.includes("too many requests") ||
    errorString.includes("429") ||
    errorString.includes("rate-limited")
  ) {
    return {
      category: "rate-limited",
      message: ERRORS.RATE_LIMITED,
      retryable: true,
    };
  }

  // Contract — check for Soroban error code first
  if (
    errorString.includes("error(contract") ||
    errorString.includes("soroban") ||
    errorString.includes("simulation") ||
    errorString.includes("contract")
  ) {
    const code = extractContractErrorCode(rawMessage);
    const contractMessage =
      code !== null && CONTRACT_ERROR_CODES[code]
        ? CONTRACT_ERROR_CODES[code]
        : ERRORS.CONTRACT;
    return {
      category: "contract",
      message: contractMessage,
      retryable: false,
    };
  }

  // Default — UNKNOWN, not contract
  return {
    category: "unknown",
    message: "An unexpected error occurred.",
    retryable: true,
  };
};
