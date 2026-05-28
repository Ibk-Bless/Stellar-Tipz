import React from "react";
import { X } from "lucide-react";
import { DateRange } from "../../hooks/useTransactionHistory";
import Button from "../../components/ui/Button";

interface TransactionFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const hasFilter = dateRange.start || dateRange.end;

  const handleClear = () => {
    onDateRangeChange({ start: "", end: "" });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="tx-date-start"
          className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200"
        >
          From date
        </label>
        <input
          id="tx-date-start"
          type="date"
          value={dateRange.start}
          max={dateRange.end || undefined}
          onChange={(e) =>
            onDateRangeChange({ ...dateRange, start: e.target.value })
          }
          className="h-10 border-2 border-black bg-white px-3 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="tx-date-end"
          className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200"
        >
          To date
        </label>
        <input
          id="tx-date-end"
          type="date"
          value={dateRange.end}
          min={dateRange.start || undefined}
          onChange={(e) =>
            onDateRangeChange({ ...dateRange, end: e.target.value })
          }
          className="h-10 border-2 border-black bg-white px-3 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      {hasFilter && (
        <Button
          variant="outline"
          size="sm"
          icon={<X size={14} />}
          onClick={handleClear}
          aria-label="Clear date filter"
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default TransactionFilters;
