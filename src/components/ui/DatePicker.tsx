'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string; // YYYY-MM-DD format
}

export default function DatePicker({ value, onChange, placeholder = 'Select date', className = '', minDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [position, setPosition] = useState<{ top: number; left: number; placement: 'bottom' | 'top' }>({ top: 0, left: 0, placement: 'bottom' });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse value on mount and when value changes
  useEffect(() => {
    if (value) {
      // Parse date string (YYYY-MM-DD) without timezone issues
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const calendarHeight = 350; // Approximate calendar height
      const calendarWidth = 300;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      let top = inputRect.bottom + 8; // 8px gap
      let left = inputRect.left;
      let placement: 'bottom' | 'top' = 'bottom';

      // Check if there's enough space below
      if (inputRect.bottom + calendarHeight + 8 > windowHeight) {
        // Not enough space below, open above
        top = inputRect.top - calendarHeight - 8;
        placement = 'top';
        // If no space above either, position it at the bottom of viewport
        if (top < 0) {
          top = windowHeight - calendarHeight - 8;
          placement = 'bottom';
        }
      }

      // Adjust horizontal position if calendar would overflow
      if (left + calendarWidth > windowWidth) {
        left = windowWidth - calendarWidth - 8;
      }
      if (left < 8) {
        left = 8;
      }

      setPosition({ top, left, placement });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
    // Format date as YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayValue = (): string => {
    if (selectedDate) {
      return selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return '';
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDate(date));
    setIsOpen(false);
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

  const days = renderCalendar(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse minDate without timezone issues
  const minDateObj = minDate ? (() => {
    const [year, month, day] = minDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  })() : today;

  const calendarContent = isOpen ? (
    <div
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-[300px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      ref={containerRef}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          type="button"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          type="button"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-8"></div>;
          }

          // Compare dates without time to avoid timezone issues
          const dateToCompare = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          dateToCompare.setHours(0, 0, 0, 0);
          
          const isPast = dateToCompare < minDateObj;
          const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
          const isToday = formatDate(date) === formatDate(today);

          return (
            <button
              key={formatDate(date)}
              type="button"
              onClick={() => !isPast && handleDateClick(date)}
              disabled={isPast}
              className={`
                h-8 w-8 rounded text-xs font-medium transition-colors
                ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-100'}
                ${isSelected ? 'bg-teal-600 text-white font-semibold hover:bg-teal-700' : ''}
                ${isToday && !isSelected ? 'border-2 border-teal-500' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formatDisplayValue()}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-500 text-gray-900 bg-white cursor-pointer"
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {typeof window !== 'undefined' && isOpen && createPortal(calendarContent, document.body)}
    </div>
  );
}

