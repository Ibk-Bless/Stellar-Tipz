import { useState, useCallback } from 'react';
import { useContract } from './useContract';
import { useWallet } from './useWallet';
import { encryptMessage } from '../helpers/encryption';
import { logger } from '../services/logger';
import { analytics } from '../services/analytics';

export type TxStatus = 'idle' | 'signing' | 'submitting' | 'confirming' | 'success' | 'error';

interface TipState {
  sending: boolean;
  withdrawing: boolean;
  error: string | null;
  txHash: string | null;
  txStatus: TxStatus;
}

interface UseTipzReturn extends TipState {
  sendTip: (creator: string, amount: string, message: string, isEncrypted?: boolean) => Promise<void>;
  withdrawTips: (amount: string) => Promise<string>;
  reset: () => void;
}

const initialState: TipState = {
  sending: false,
  withdrawing: false,
  error: null,
  txHash: null,
  txStatus: 'idle',
};

export const useTipz = (): UseTipzReturn => {
  const [state, setState] = useState<TipState>(initialState);
  const { sendTip: contractSendTip, withdrawTips: contractWithdrawTips } = useContract();

  const { publicKey } = useWallet();

  const sendTip = useCallback(async (creator: string, amount: string, message: string, isEncrypted?: boolean): Promise<void> => {
    let finalMessage = message;
    if (isEncrypted) {
      try {
        finalMessage = encryptMessage(message, creator);
      } catch (err) {
        const errMsg = 'Failed to encrypt message';
        setState((prev) => ({ ...prev, sending: false, error: errMsg, txStatus: 'error' }));
        throw new Error(errMsg);
      }
    }

    setState({ ...initialState, sending: true, txStatus: 'signing' });
    const submittingTimer = window.setTimeout(() => {
      setState((prev) =>
        prev.sending && prev.txStatus === 'signing'
          ? { ...prev, txStatus: 'submitting' }
          : prev,
      );
    }, 900);
    const confirmingTimer = window.setTimeout(() => {
      setState((prev) =>
        prev.sending && prev.txStatus === 'submitting'
          ? { ...prev, txStatus: 'confirming' }
          : prev,
      );
    }, 2400);
    try {
      // The useContract.sendTip method handles signing and submission
      const result = await contractSendTip(creator, amount, finalMessage, isEncrypted);
      window.clearTimeout(submittingTimer);
      window.clearTimeout(confirmingTimer);
      
      analytics.trackEvent('tip_sent', { amount: parseFloat(amount) });
      
      setState((prev) => ({ 
        ...prev, 
        txStatus: 'success', 
        sending: false, 
        txHash: result // Assuming the contract method returns the tx hash/id
      }));
    } catch (err) {
      window.clearTimeout(submittingTimer);
      window.clearTimeout(confirmingTimer);
      logger.error('hooks/useTipz', 'Tip transaction failed', undefined, err instanceof Error ? err : new Error(String(err)));
      const message = err instanceof Error ? err.message : 'Failed to send tip';
      setState((prev) => ({ 
        ...prev, 
        sending: false, 
        error: message, 
        txStatus: 'error' 
      }));
      throw err; // Re-throw to allow component-level handling
    }
  }, [contractSendTip, publicKey]);

  const withdrawTips = useCallback(async (amount: string): Promise<string> => {
    setState({ ...initialState, withdrawing: true, txStatus: 'signing' });
    try {
      const result = await contractWithdrawTips(amount);
      
      setState((prev) => ({ 
        ...prev, 
        txStatus: 'success', 
        withdrawing: false, 
        txHash: result 
      }));
      return result;
    } catch (err) {
      logger.error('hooks/useTipz', 'Withdrawal failed', undefined, err instanceof Error ? err : new Error(String(err)));
      const message = err instanceof Error ? err.message : 'Failed to withdraw tips';
      setState((prev) => ({ 
        ...prev, 
        withdrawing: false, 
        error: message, 
        txStatus: 'error' 
      }));
      throw err;
    }
  }, [contractWithdrawTips]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { ...state, sendTip, withdrawTips, reset };
};
