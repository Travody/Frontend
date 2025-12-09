'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgGradient?: string;
  className?: string;
  formatValue?: (value: string | number) => string;
  iconFill?: boolean;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'blue',
  bgGradient,
  className,
  formatValue,
  iconFill = false,
}: StatCardProps) {
  // Theme-based colors with teal accents
  const themeColors = {
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    textColor: 'text-gray-600',
    borderColor: 'border-teal-200',
    bgColor: 'bg-white',
    hoverIconBg: 'bg-teal-100',
  };

  const colors = themeColors;
  const bgColor = bgGradient || colors.bgColor;

  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border shadow-sm hover:-translate-y-0.5 bg-white w-full",
      "hover:border-teal-300",
      colors.borderColor,
      className
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className={cn(
            "p-2 sm:p-2.5 rounded-lg transition-all duration-300 flex-shrink-0",
            "group-hover:scale-105 group-hover:bg-teal-100",
            colors.iconBg
          )}>
            <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", colors.iconColor, iconFill && "fill-teal-600")} />
          </div>
          <div className="text-right flex-1 min-w-0 ml-2">
            <p className={cn(
              "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate",
              colors.textColor
            )}>
              {title}
            </p>
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight break-words group-hover:text-teal-700 transition-colors">{displayValue}</p>
          {description && (
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

