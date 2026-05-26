import React from 'react';
import Skeleton from './Skeleton';

interface ChangeProps {
  value: number;
  positive: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: ChangeProps;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  change,
  className = '',
}) => {
  const isPositive = change?.positive ?? false;
  const changeValue = Math.abs(change?.value ?? 0);
  const formattedChange = `${isPositive ? '+' : '-'}${changeValue}%`;

  return (
    <div
      className={`
        bg-white dark:bg-zinc-950 
        border-4 border-black dark:border-white 
        p-6 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
        dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]
        hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] 
        dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.3)]
        transition-all duration-200
        flex flex-col
        ${className}
      `}
    >
      {/* Label + Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-mono uppercase tracking-[3px] text-zinc-500 dark:text-zinc-400 font-bold">
          {label}
        </div>
        
        {icon && <div className="text-3xl">{icon}</div>}
      </div>

      {/* Value */}
      <div className="text-5xl font-black tracking-tighter text-black dark:text-white mb-4">
        {value}
      </div>

      {/* Change Indicator */}
      {change && (
        <div
          className={`flex items-center gap-2 text-sm font-semibold ${
            isPositive 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          <span className="text-xl">
            {isPositive ? '↑' : '↓'}
          </span>
          <span>{formattedChange}</span>
          <span className="text-zinc-400 font-normal text-xs">from last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
      className={`
        bg-white dark:bg-zinc-950 
        border-4 border-black dark:border-white 
        p-6 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
        dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]
        transition-all duration-200
        flex flex-col
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="120px" height="14px" />
        <Skeleton variant="rect" width="28px" height="28px" />
      </div>
      <Skeleton variant="text" width="70%" height="48px" className="mb-4" />
      <div className="flex items-center gap-2">
        <Skeleton variant="rect" width="18px" height="18px" />
        <Skeleton variant="text" width="80px" height="14px" />
        <Skeleton variant="text" width="110px" height="10px" />
      </div>
    </div>
  );
};
