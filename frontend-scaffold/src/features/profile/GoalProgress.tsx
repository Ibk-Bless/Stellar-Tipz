import React from 'react';
import { Target, Trophy, Users, Share2 } from 'lucide-react';
import type { Goal } from '@/types/contract';
import { useGoalStore } from '@/store/goalStore';
import { stroopToXlm } from '@/helpers/format';
import ShareButton from '@/components/shared/ShareButton';
import { createGoalShareData } from '@/helpers/sharing';

interface GoalProgressProps {
  goal?: Goal;
  creatorAddress?: string;
  showShare?: boolean;
}

function calcPercent(raised: bigint, target: bigint): number {
  if (target === 0n) return 0;
  const pct = Number((raised * 100n) / target);
  return Math.min(pct, 100);
}

function formatTimeLeft(endDate: number): string {
  const diff = endDate - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goal: propGoal, creatorAddress, showShare = true }) => {
  const storeGoal = useGoalStore((s) =>
    creatorAddress
      ? s.goals.find((g) => g.creator === creatorAddress && g.active)
      : s.goals.find((g) => g.active),
  );
  const goal = propGoal || storeGoal;

  if (!goal) return null;

  const raised = BigInt(goal.raisedAmount);
  const target = BigInt(goal.targetAmount);
  const percent = calcPercent(raised, target);
  const isCompleted = goal.completed || percent >= 100;

  return (
    <div className="border-2 border-black bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-blue-600" />
          <h3 className="text-sm font-black uppercase tracking-wide">{goal.title}</h3>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black uppercase text-green-700">
            <Trophy size={14} />
            Goal reached!
          </span>
        )}
      </div>

      {goal.description && (
        <p className="text-xs text-gray-600">{goal.description}</p>
      )}

      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-gray-700">
          {stroopToXlm(goal.raisedAmount)} XLM
        </span>
        <span className="text-gray-500">
          of {stroopToXlm(goal.targetAmount)} XLM
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% funded`}
        className="h-4 w-full border-2 border-black bg-gray-100"
      >
        <div
          className={`h-full transition-all duration-500 ${
            isCompleted ? 'bg-green-400' : 'bg-blue-400'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 text-xs font-bold text-gray-600">
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{goal.supporters} supporter{goal.supporters !== 1 ? 's' : ''}</span>
        </div>
        <span>{formatTimeLeft(goal.endDate)}</span>
      </div>

      {isCompleted && (
        <p className="text-center text-sm font-black uppercase text-green-600">
          This goal has been reached!
        </p>
      )}

      {showShare && creatorAddress && (
        <ShareButton
          type="goal"
          data={createGoalShareData(goal.title, stroopToXlm(goal.targetAmount), percent, creatorAddress)}
          variant="icon"
          size="sm"
        />
      )}
    </div>
  );
};

export default GoalProgress;
