'use client';

import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  homeHref?: string;
}

export function Breadcrumb({ items, className, showHome = true, homeHref = '/guider/dashboard' }: BreadcrumbProps) {
  const { goBack } = useNavigationHistory();

  const breadcrumbItems: BreadcrumbItem[] = showHome
    ? [
        {
          label: 'Home',
          href: homeHref,
        },
        ...items,
      ]
    : items;

  return (
    <nav 
      className={cn(
        'bg-white border-b border-gray-200 py-3.5',
        'shadow-sm sticky top-16 z-40 backdrop-blur-md bg-white/98',
        'transition-all duration-200',
        className
      )} 
      aria-label="Breadcrumb"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-1 sm:space-x-2">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isHome = index === 0 && item.label === 'Home';

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1.5 sm:mx-2 flex-shrink-0" />
                )}
                {isLast ? (
                  <span className="text-gray-900 font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-[400px] flex items-center gap-1.5">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-primary-600 transition-colors truncate max-w-[150px] sm:max-w-[250px] text-sm sm:text-base flex items-center gap-1.5 group"
                  >
                    {isHome && <Home className="w-4 h-4 flex-shrink-0 group-hover:text-primary-600" />}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="text-gray-600 hover:text-primary-600 transition-colors truncate max-w-[150px] sm:max-w-[250px] text-sm sm:text-base flex items-center gap-1.5"
                  >
                    {isHome && <Home className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </button>
                ) : (
                  <span
                    onClick={() => goBack()}
                    className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer truncate max-w-[150px] sm:max-w-[250px] text-sm sm:text-base flex items-center gap-1.5"
                  >
                    {isHome && <Home className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
