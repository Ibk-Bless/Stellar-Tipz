/**
 * Gas Estimation Service
 * Simulates transactions and estimates fees before submission
 * Issue #599
 */

import { SorobanRpc, Transaction } from '@stellar/stellar-sdk';
import { logger } from './logger';

export interface FeeEstimation {
  estimatedFee: string; // in stroops
  estimatedFeeXLM: string; // in XLM
  baseFee: string;
  resourceFees: string;
  breakdown: {
    cpuInstructions: number;
    memoryBytes: number;
    readBytes: number;
    writeBytes: number;
  };
  isHighFee: boolean;
  hasSufficientBalance: boolean;
}

const STROOPS_PER_XLM = 10_000_000;
const HIGH_FEE_THRESHOLD_XLM = 0.1; // 0.1 XLM

/**
 * Simulate a transaction and estimate gas costs
 */
export async function estimateTransactionFee(
  transaction: Transaction,
  server: SorobanRpc.Server,
  userBalance?: string
): Promise<FeeEstimation> {
  try {
    // Simulate the transaction
    const simulation = await server.simulateTransaction(transaction);

    if (SorobanRpc.Api.isSimulationError(simulation)) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    // Extract fee information
    const minResourceFee = simulation.minResourceFee || '0';
    const baseFee = transaction.fee || '100';
    const totalFee = (BigInt(baseFee) + BigInt(minResourceFee)).toString();
    const totalFeeXLM = (Number(totalFee) / STROOPS_PER_XLM).toFixed(7);

    // Check if fee is high
    const isHighFee = Number(totalFeeXLM) > HIGH_FEE_THRESHOLD_XLM;

    // Check if user has sufficient balance
    const hasSufficientBalance = userBalance
      ? BigInt(userBalance) > BigInt(totalFee)
      : true;

    // Extract resource breakdown
    const breakdown = {
      cpuInstructions: Number(simulation.cost?.cpuInsns || 0),
      memoryBytes: Number(simulation.cost?.memBytes || 0),
      readBytes: Number(simulation.cost?.readBytes || 0),
      writeBytes: Number(simulation.cost?.writeBytes || 0),
    };

    return {
      estimatedFee: totalFee,
      estimatedFeeXLM: totalFeeXLM,
      baseFee,
      resourceFees: minResourceFee,
      breakdown,
      isHighFee,
      hasSufficientBalance,
    };
  } catch (error) {
    logger.error('services/gasEstimation', 'Fee estimation failed', undefined, error instanceof Error ? error : new Error(String(error)));
    // Return fallback estimation
    return getFallbackEstimation(userBalance);
  }
}

/**
 * Get fallback estimation when simulation fails
 */
function getFallbackEstimation(userBalance?: string): FeeEstimation {
  const fallbackFee = '1000000'; // 0.1 XLM fallback
  const fallbackFeeXLM = '0.1';

  return {
    estimatedFee: fallbackFee,
    estimatedFeeXLM: fallbackFeeXLM,
    baseFee: '100',
    resourceFees: '999900',
    breakdown: {
      cpuInstructions: 0,
      memoryBytes: 0,
      readBytes: 0,
      writeBytes: 0,
    },
    isHighFee: false,
    hasSufficientBalance: userBalance
      ? BigInt(userBalance) > BigInt(fallbackFee)
      : true,
  };
}

/**
 * Format fee for display
 */
export function formatFee(fee: string): string {
  const feeXLM = Number(fee) / STROOPS_PER_XLM;
  return `${feeXLM.toFixed(7)} XLM`;
}

/**
 * Check if user has sufficient balance for transaction
 */
export function checkSufficientBalance(
  balance: string,
  amount: string,
  fee: string
): boolean {
  const total = BigInt(amount) + BigInt(fee);
  return BigInt(balance) >= total;
}
