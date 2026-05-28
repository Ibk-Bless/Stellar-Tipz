import React from "react";
import BigNumber from "bignumber.js";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import AmountDisplay from "@/components/shared/AmountDisplay";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { stroopToXlmBigNumber, xlmToStroop } from "@/helpers/format";
import { useTipz, useProfile } from "@/hooks";
import Input from "@/components/ui/Input";
import TransactionStatus from "@/components/shared/TransactionStatus";
import { useToastStore } from "@/store/toastStore";
import { ERRORS, categorizeError } from "@/helpers/error";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: string;
  feeBps: number;
}

/**
 * WithdrawModal allows creators to withdraw their earned tips to  their connected wallet.
 */
const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  balance,
  feeBps,
}) => {
  const [amount, setAmount] = React.useState("");
  const [isWithdrawAllDialogOpen, setIsWithdrawAllDialogOpen] = React.useState(false);
  const { withdrawTips, withdrawing, error, txHash, txStatus, reset } =
    useTipz();
  const { refetch } = useProfile();
  const { addToast } = useToastStore();

  const balanceXlm = React.useMemo(
    () => stroopToXlmBigNumber(balance || "0"),
    [balance],
  );

  React.useEffect(() => {
    if (isOpen) {
      setAmount(balanceXlm.toFixed());
    }
  }, [balanceXlm, isOpen]);

  const parsedAmount = React.useMemo(() => {
    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      return null;
    }

    const nextAmount = new BigNumber(trimmedAmount);
    return nextAmount.isFinite() ? nextAmount : null;
  }, [amount]);

  const amountError = React.useMemo(() => {
    if (!amount.trim()) {
      return "Enter the amount you want to withdraw.";
    }

    if (!parsedAmount) {
      return "Enter a valid XLM amount.";
    }

    if (parsedAmount.lte(0)) {
      return "Withdrawal amount must be greater than zero.";
    }

    if (parsedAmount.gt(balanceXlm)) {
      return "Withdrawal amount cannot exceed your available balance.";
    }

    return null;
  }, [amount, parsedAmount, balanceXlm]);

  const requestedStroops = React.useMemo(() => {
    if (!parsedAmount || amountError) {
      return "0";
    }

    return xlmToStroop(parsedAmount).toFixed(0);
  }, [amountError, parsedAmount]);

  const fee = React.useMemo(() => {
    const rawAmount = BigInt(requestedStroops);
    return ((rawAmount * BigInt(feeBps)) / BigInt(10_000)).toString();
  }, [feeBps, requestedStroops]);

  const netAmount = React.useMemo(() => {
    const rawAmount = BigInt(requestedStroops);
    const rawFee = BigInt(fee);
    return (rawAmount - rawFee).toString();
  }, [fee, requestedStroops]);

  const canWithdraw = !amountError;
  const isWithdrawingAll = parsedAmount?.eq(balanceXlm) ?? false;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw) return;

    // Show confirmation dialog for withdraw all
    if (isWithdrawingAll) {
      setIsWithdrawAllDialogOpen(true);
      return;
    }

    await performWithdraw();
  };

  const performWithdraw = async () => {
    try {
      await withdrawTips(amount);
      addToast({
        type: "success",
        message: `Successfully withdrawn ${amount} XLM`,
        duration: 5000,
      });
      refetch();
      setTimeout(onClose, 2000); // Close after a short delay to show success state
    } catch (err) {
      console.error("Withdrawal failed:", err);
    }
  };

  const handleClose = () => {
    reset();
    setAmount(balanceXlm.toFixed());
    setIsWithdrawAllDialogOpen(false);
    onClose();
  };

  const handleConfirmWithdrawAll = async () => {
    setIsWithdrawAllDialogOpen(false);
    await performWithdraw();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Withdraw Tips">
      <form onSubmit={handleWithdraw} className="space-y-6">
        <p className="text-gray-600 font-medium">
          Transfer your available balance to your connected Stellar wallet. A
          platform fee of {(feeBps / 100).toFixed(1)}% applies.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Amount to Withdraw"
              type="number"
              step="0.0000001"
              min="0"
              max={balanceXlm.toFixed()}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={withdrawing || txStatus === "success"}
              error={amountError ?? undefined}
            />
            <button
              type="button"
              onClick={() => setAmount(balanceXlm.toFixed())}
              className="absolute right-3 top-[38px] text-xs font-black uppercase underline hover:text-gray-600"
              disabled={withdrawing || txStatus === "success"}
            >
              Max
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border-2 border-black bg-gray-50">
              <p className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-300">
                Requested
              </p>
              <AmountDisplay
                amount={requestedStroops}
                className="mt-2 block text-lg"
              />
            </div>
            <div className="p-3 border-2 border-black bg-gray-50">
              <p className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-300">
                Platform Fee
              </p>
              <AmountDisplay amount={fee} className="mt-2 block text-lg" />
            </div>
            <div className="p-3 border-2 border-black bg-green-50">
              <p className="text-[10px] font-black uppercase text-green-600">
                You'll Receive
              </p>
              <AmountDisplay
                amount={netAmount}
                className="mt-2 block text-lg text-green-700"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-4 border-black bg-yellow-100 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 mb-2 text-center">
            Total Available Balance
          </p>
          <AmountDisplay amount={balance} className="text-3xl" />
        </div>

        {txStatus === "signing" ||
        txStatus === "submitting" ||
        txStatus === "confirming" ? (
          <TransactionStatus
            status={txStatus}
            txHash={txHash ?? undefined}
            errorMessage={
              error
                ? categorizeError(error).category === "network"
                  ? ERRORS.NETWORK
                  : ERRORS.CONTRACT
                : undefined
            }
          />
        ) : null}

        {txStatus === "success" && (
          <div
            className="p-3 border-2 border-green-500 bg-green-50 text-green-700 text-sm font-bold text-center uppercase"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            Withdrawal Successful!
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="w-full"
            loading={withdrawing}
            disabled={withdrawing || !canWithdraw || txStatus === "success"}
          >
            {withdrawing ? "Processing..." : "Confirm Withdrawal"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            type="button"
            onClick={handleClose}
            className="w-full"
            disabled={withdrawing}
          >
            {txStatus === "success" ? "Done" : "Cancel"}
          </Button>
        </div>

        <p className="text-[10px] text-center font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest leading-relaxed">
          Network fees will be deducted by the Stellar network.
          <br />
          Funds will be available in your wallet instantly.
        </p>
      </form>

      <ConfirmDialog
        isOpen={isWithdrawAllDialogOpen}
        onClose={() => setIsWithdrawAllDialogOpen(false)}
        onConfirm={handleConfirmWithdrawAll}
        title="Withdraw All Funds"
        message={`Are you sure you want to withdraw your entire balance of ${balanceXlm.toFixed(7)} XLM?`}
        confirmText="Withdraw All"
        cancelText="Cancel"
        loading={withdrawing}
        consequences={[
          "Your entire balance will be transferred to your wallet",
          `Platform fee of ${(feeBps / 100).toFixed(1)}% will be deducted`,
          "Your profile balance will be reset to zero",
          "This action cannot be undone"
        ]}
      />
    </Modal>
  );
};

export default WithdrawModal;
