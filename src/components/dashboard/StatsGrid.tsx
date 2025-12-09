'use client';

import StatCard, { StatCardProps } from './StatCard';
import { cn } from '@/lib/utils';

export interface StatsGridProps {
  stats: StatCardProps[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export default function StatsGrid({ stats, className, columns = 4 }: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-3 sm:gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

