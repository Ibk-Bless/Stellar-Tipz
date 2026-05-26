import React from 'react';
import BigNumber from 'bignumber.js';
import { formatXlmDisplay } from '../../helpers/format';

interface FeeBreakdownProps {
  amountBigNumber: BigNumber;
  amountInStroops: BigNumber | null;
  platformFeeXlm: BigNumber;
  networkFeeXlm: BigNumber;
  totalCost: BigNumber;
  balanceBigNumber: BigNumber | null;
  connected: boolean;
}

const FeeBreakdown: React.FC<FeeBreakdownProps> = ({
  amountBigNumber,
  platformFeeXlm,
  networkFeeXlm,
  totalCost,
  balanceBigNumber,
  connected,
}) => {
  // If amount is not somewhat valid (e.g. 0), we might not render fee breakdown
  if (amountBigNumber.isZero()) return null;

  return (
    <div className="space-y-3 border-2 border-black bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">
          Payment summary
        </p>
        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
          Estimated before signing
        </p>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="font-bold text-gray-600">Tip amount</dt>
          <dd className="text-right font-black tabular-nums">
            {formatXlmDisplay(amountBigNumber)} XLM
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-bold text-gray-600">Platform fee (2%)</dt>
          <dd className="text-right font-bold tabular-nums text-gray-700">
            {formatXlmDisplay(platformFeeXlm)} XLM
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-bold text-gray-600">Estimated network fee</dt>
          <dd className="text-right font-bold tabular-nums text-gray-700">
            {formatXlmDisplay(networkFeeXlm)} XLM
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-black pt-2">
          <dt className="font-black uppercase tracking-wide">Total cost</dt>
          <dd className="text-right font-black tabular-nums">
            {formatXlmDisplay(totalCost)} XLM
          </dd>
        </div>
      </dl>

      {connected && balanceBigNumber && totalCost.gt(balanceBigNumber) && (
        <p className="border-2 border-red-600 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          Insufficient balance constraint: This total cost exceeds your current wallet balance.
        </p>
      )}
    </div>
  );
};

export default FeeBreakdown;
