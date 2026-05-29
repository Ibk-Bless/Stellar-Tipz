import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGoalStore } from '@/store/goalStore';
import Button from '@/components/ui/Button';
import type { Goal } from '@/types/contract';

interface SetGoalFormProps {
  creatorAddress: string;
  existingGoal?: Goal | null;
  onClose?: () => void;
}

const SetGoalForm: React.FC<SetGoalFormProps> = ({ creatorAddress, existingGoal, onClose }) => {
  const setGoal = useGoalStore((s) => s.setGoal);
  const [title, setTitle] = useState(existingGoal?.title ?? '');
  const [description, setDescription] = useState(existingGoal?.description ?? '');
  const [targetXlm, setTargetXlm] = useState(
    existingGoal ? String(Number(existingGoal.targetAmount) / 1e7) : '',
  );
  const [endDate, setEndDate] = useState(
    existingGoal
      ? new Date(existingGoal.endDate).toISOString().slice(0, 10)
      : '',
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!targetXlm || Number(targetXlm) <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }
    if (!endDate) {
      setError('End date is required');
      return;
    }

    const targetStroops = BigInt(Math.round(Number(targetXlm) * 1e7)).toString();
    const now = Date.now();
    const end = new Date(endDate).getTime();

    if (end <= now) {
      setError('End date must be in the future');
      return;
    }

    const goal: Goal = {
      creator: creatorAddress,
      title: title.trim(),
      description: description.trim(),
      targetAmount: targetStroops,
      raisedAmount: existingGoal?.raisedAmount ?? '0',
      supporters: existingGoal?.supporters ?? 0,
      startDate: existingGoal?.startDate ?? now,
      endDate: end,
      active: true,
      completed: false,
    };

    setGoal(goal);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wide">
          {existingGoal ? 'Edit Goal' : 'Set a Fundraising Goal'}
        </h3>
        {onClose && (
          <button type="button" onClick={onClose} className="p-1 hover:opacity-60">
            <X size={16} />
          </button>
        )}
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
          Goal title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. New camera lens"
          className="mt-1 block w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you raising funds for?"
          rows={3}
          className="mt-1 block w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
          Target amount (XLM)
        </label>
        <input
          type="number"
          step="0.1"
          min="1"
          value={targetXlm}
          onChange={(e) => setTargetXlm(e.target.value)}
          placeholder="e.g. 500"
          className="mt-1 block w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
          End date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600">{error}</p>
      )}

      <Button type="submit" variant="primary" className="w-full">
        {existingGoal ? 'Update Goal' : 'Start Goal'}
      </Button>
    </form>
  );
};

export default SetGoalForm;
