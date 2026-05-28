import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download, ExternalLink, Mail } from 'lucide-react';
import { getExplorerTxUrl } from '../../helpers/network';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/layout/PageContainer';

interface TipReceiptProps {
  txHash?: string;
  amount?: string;
  sender?: string;
  receiver?: string;
  timestamp?: number;
}

const TipReceipt: React.FC<TipReceiptProps> = ({
  txHash,
  amount,
  sender,
  receiver,
  timestamp,
}) => {
  const safeTxHash = txHash ?? "unknown";
  const receiptRef = useRef<HTMLDivElement>(null);
  const [displayTimestamp] = React.useState(() => timestamp || Date.now());

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `tipz-receipt-${safeTxHash.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate receipt image:', error);
    }
  };

  const txUrl = txHash ? getExplorerTxUrl(txHash) : "#";

  return (
    <PageContainer maxWidth="md" ariaLabel="Tip receipt content" className="mt-8">
      <div 
        ref={receiptRef}
        className="bg-white border-2 border-black p-6 max-w-md mx-auto space-y-4"
        style={{ printColorAdjust: 'exact' }}
      >
        <div className="text-center pb-4 border-b-2 border-black border-dashed">
          <h1 className="text-2xl font-black uppercase tracking-widest">TIPZ RECEIPT</h1>
          <p className="text-sm font-bold text-gray-500 mt-1">
            {new Date(displayTimestamp).toLocaleString()}
          </p>
        </div>

        <div className="space-y-3 py-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Amount</span>
            <span className="text-lg font-black">{amount || 'N/A'} XLM</span>
          </div>
          {sender && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">From</span>
              <span className="text-sm font-bold truncate max-w-[150px]" title={sender}>{sender.slice(0, 6)}...{sender.slice(-4)}</span>
            </div>
          )}
          {receiver && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">To</span>
              <span className="text-sm font-bold truncate max-w-[150px]">@{receiver}</span>
            </div>
          )}
          <div className="flex flex-col gap-1 pt-2">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Transaction Hash</span>
            <span className="text-xs font-mono bg-gray-100 p-2 border border-gray-300 break-all">{safeTxHash}</span>
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t-2 border-black border-dashed">
          <div className="border-4 border-black p-2 bg-white">
            <QRCodeSVG value={txUrl} size={100} level="M" />
          </div>
        </div>
        <p className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
          Scan to view transaction
        </p>
      </div>

      <section
        role="region"
        aria-label="Receipt actions"
        className="flex flex-col sm:flex-row gap-3 justify-center mt-6"
      >
        <Button onClick={handleDownload} icon={<Download size={18} />}>
          Download
        </Button>
        <a 
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none"
        >
          <Button variant="outline" icon={<ExternalLink size={18} />} className="w-full" disabled={!txHash}>
            View on Explorer
          </Button>
        </a>
        <Button variant="outline" icon={<Mail size={18} />} disabled title="Email receipt option (future)">
          Email
        </Button>
      </section>
    </PageContainer>
  );
};

export default TipReceipt;
