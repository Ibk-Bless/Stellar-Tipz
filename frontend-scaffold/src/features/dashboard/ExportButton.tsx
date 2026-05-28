import React, { useMemo, useState } from 'react';
import { useTips } from '../../hooks/useTips';
import { useWalletStore } from '../../store/walletStore';
import { exportTipHistoryCSV, exportTipHistoryPDF, filterTipHistoryByDate } from '@/helpers/export';
import { formatTimestamp, stroopToXlm } from '@/helpers/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type Role = 'creator' | 'tipper';

interface ExportButtonProps {
  role?: Role;
  limit?: number;
}

const ExportButton: React.FC<ExportButtonProps> = ({ role = 'creator', limit = 100 }) => {
  const { publicKey } = useWalletStore();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { tips, loading: tipsLoading, error: tipsError, refetch } = useTips(
    publicKey || '',
    role,
    limit
  );

  // Convert tips from useTips to our TipHistoryItem shape
  const tipHistoryItems = useMemo(() => {
    return tips.map((tip) => ({
      date: tip.timestamp, // Unix timestamp in seconds
      from: tip.tipper,
      to: tip.creator,
      amount: tip.amount, // in stroops as string
      message: tip.message,
      txHash: undefined // We don't have txHash in tip data
    }));
  }, [tips]);

  const filteredHistory = useMemo(() => {
    return filterTipHistoryByDate(tipHistoryItems, {
      from: startDate || undefined,
      to: endDate || undefined
    });
  }, [tipHistoryItems, startDate, endDate]);

  const handleExportCSV = async () => {
    if (filteredHistory.length === 0) {
      alert('No data to export');
      return;
    }
    setLoading(true);
    try {
      exportTipHistoryCSV(filteredHistory, {
        from: startDate || undefined,
        to: endDate || undefined
      }, 'tip-history.csv');
    } catch (err) {
      console.error('Export CSV failed:', err);
      alert('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (filteredHistory.length === 0) {
      alert('No data to export');
      return;
    }
    setLoading(true);
    try {
      exportTipHistoryPDF(filteredHistory, {
        from: startDate || undefined,
        to: endDate || undefined
      }, 'tip-history.pdf');
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  if (tipsLoading && tips.length === 0) {
    return <div className="flex justify-center py-4">Loading...</div>;
  }

  if (tipsError) {
    return <div className="text-red-500">Error: {tipsError}</div>;
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2 sm:items-center">
        <label className="text-sm font-medium">Date Range:</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start date"
          className="w-32"
        />
        <span className="mx-2">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End date"
          className="w-32"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={loading || filteredHistory.length === 0}
          className="flex items-center gap-2"
        >
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={loading || filteredHistory.length === 0}
          className="flex items-center gap-2"
        >
          Export PDF
        </Button>
      </div>
    </div>
  );
};

export default ExportButton;