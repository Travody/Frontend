'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DateRangePicker({ value, onChange, placeholder = 'Select date range', className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value on mount and when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split(' to ');
      if (parts.length === 2) {
        // Parse dates in local timezone to avoid timezone shifts
        const [startYear, startMonth, startDay] = parts[0].trim().split('-').map(Number);
        const [endYear, endMonth, endDay] = parts[1].trim().split('-').map(Number);
        const start = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          setStartDate(start);
          setEndDate(end);
        }
      } else {
        // Parse date in local timezone to avoid timezone shifts
        const [year, month, day] = value.trim().split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          setStartDate(date);
          setEndDate(null);
        }
      }
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date): string => {
    // Format date in local timezone to avoid timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayValue = (): string => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    } else if (startDate) {
      return formatDate(startDate);
    }
    return '';
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date);
      setEndDate(null);
      // Update onChange immediately for single date selection
      onChange(formatDate(date));
    } else if (startDate && !endDate) {
      // Complete selection
      if (date < startDate) {
        // If clicked date is before start, swap them
        setEndDate(startDate);
        setStartDate(date);
        onChange(`${formatDate(date)} to ${formatDate(startDate)}`);
      } else {
        setEndDate(date);
        onChange(`${formatDate(startDate)} to ${formatDate(date)}`);
      }
      setIsOpen(false);
    }
  };

  const handleDateHover = (date: Date) => {
    if (startDate && !endDate) {
      setHoverDate(date);
    }
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate) return false;
    
    const dateStr = formatDate(date);
    const startStr = formatDate(startDate);
    
    if (endDate) {
      const endStr = formatDate(endDate);
      return dateStr >= startStr && dateStr <= endStr;
    }
    
    if (hoverDate && startDate) {
      const hoverStr = formatDate(hoverDate);
      if (hoverDate < startDate) {
        return dateStr >= hoverStr && dateStr <= startStr;
      } else {
        return dateStr >= startStr && dateStr <= hoverStr;
      }
    }
    
    return dateStr === startStr;
  };

  const isDateStart = (date: Date): boolean => {
    if (!startDate) return false;
    return formatDate(date) === formatDate(startDate);
  };

  const isDateEnd = (date: Date): boolean => {
    if (!endDate) return false;
    return formatDate(date) === formatDate(endDate);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = (month: Date) => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), day));
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const month1 = currentMonth;
  const month2 = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  const days1 = renderCalendar(month1);
  const days2 = renderCalendar(month2);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative w-full">
        <input
          type="text"
          readOnly
          value={formatDisplayValue()}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full pl-10 pr-4 h-11 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-500 text-gray-900 bg-white cursor-pointer text-base md:text-sm shadow-sm transition-colors"
          suppressHydrationWarning
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 sm:p-4 w-[calc(100vw-2rem)] sm:w-[580px] left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 top-full max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Month 1 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                  type="button"
                  suppressHydrationWarning
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                  {monthNames[month1.getMonth()]} {month1.getFullYear()}
                </h3>
                <div className="w-6"></div>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                {dayLabels.map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {days1.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="h-8 sm:h-8"></div>;
                  }

                  const isPast = date < today;
                  const inRange = isDateInRange(date);
                  const isStart = isDateStart(date);
                  const isEnd = isDateEnd(date);

                  return (
                    <button
                      key={formatDate(date)}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => handleDateHover(date)}
                      disabled={isPast}
                      className={`
                        h-8 sm:h-8 w-full aspect-square rounded text-[10px] sm:text-xs font-medium transition-colors
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-100'}
                        ${inRange ? 'bg-primary-100 text-primary-900' : ''}
                        ${isStart || isEnd ? 'bg-primary-600 text-white font-semibold' : ''}
                        ${isStart && isEnd ? 'rounded' : ''}
                        ${isStart && !isEnd ? 'rounded-l' : ''}
                        ${isEnd && !isStart ? 'rounded-r' : ''}
                      `}
                      suppressHydrationWarning
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Month 2 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                  {monthNames[month2.getMonth()]} {month2.getFullYear()}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                  type="button"
                  suppressHydrationWarning
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                {dayLabels.map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {days2.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="h-8 sm:h-8"></div>;
                  }

                  const isPast = date < today;
                  const inRange = isDateInRange(date);
                  const isStart = isDateStart(date);
                  const isEnd = isDateEnd(date);

                  return (
                    <button
                      key={formatDate(date)}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => handleDateHover(date)}
                      disabled={isPast}
                      className={`
                        h-8 sm:h-8 w-full aspect-square rounded text-[10px] sm:text-xs font-medium transition-colors
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-100'}
                        ${inRange ? 'bg-primary-100 text-primary-900' : ''}
                        ${isStart || isEnd ? 'bg-primary-600 text-white font-semibold' : ''}
                        ${isStart && isEnd ? 'rounded' : ''}
                        ${isStart && !isEnd ? 'rounded-l' : ''}
                        ${isEnd && !isStart ? 'rounded-r' : ''}
                      `}
                      suppressHydrationWarning
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                onChange('');
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              suppressHydrationWarning
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
              suppressHydrationWarning
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

