import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Globe,
  AlertCircle,
} from 'lucide-react';

interface DateTimePickerProps {
  value: Date;
  onChange: (newDate: Date) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target.getTime() < today.getTime();
}

function formatRelativeTime(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return 'Selected time is in the past';

  const totalMinutes = Math.round(diffMs / 60000);
  if (totalMinutes < 60) {
    return `Dispatches in ${totalMinutes} ${totalMinutes === 1 ? 'minute' : 'minutes'}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours < 24) {
    return `Dispatches in ${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `Dispatches in ${days} ${days === 1 ? 'day' : 'days'}${remHours > 0 ? `, ${remHours}h` : ''}`;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange }) => {
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date(value.getFullYear(), value.getMonth(), 1));

  const timeZoneName = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Local Time';
    }
  }, []);

  // Build calendar grid for viewMonth
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [viewMonth]);

  const handleSelectDay = (day: Date) => {
    if (isBeforeToday(day)) return;
    const updated = new Date(value);
    updated.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(updated);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value; // "HH:mm"
    if (!raw) return;
    const [hh, mm] = raw.split(':').map(Number);
    if (isNaN(hh) || isNaN(mm)) return;
    const updated = new Date(value);
    updated.setHours(hh, mm, 0, 0);
    onChange(updated);
  };

  const applyPreset = (presetType: 'in2Hours' | 'tomorrowMorning' | 'tomorrowAfternoon' | 'nextMonday') => {
    const now = new Date();
    const target = new Date(now);

    if (presetType === 'in2Hours') {
      target.setHours(now.getHours() + 2, 0, 0, 0);
    } else if (presetType === 'tomorrowMorning') {
      target.setDate(now.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (presetType === 'tomorrowAfternoon') {
      target.setDate(now.getDate() + 1);
      target.setHours(14, 0, 0, 0);
    } else if (presetType === 'nextMonday') {
      const day = now.getDay();
      const daysUntilMonday = ((8 - day) % 7) || 7;
      target.setDate(now.getDate() + daysUntilMonday);
      target.setHours(9, 0, 0, 0);
    }

    setViewMonth(new Date(target.getFullYear(), target.getMonth(), 1));
    onChange(target);
  };

  const timeInputValue = `${String(value.getHours()).padStart(2, '0')}:${String(
    value.getMinutes()
  ).padStart(2, '0')}`;

  const isPastTime = value.getTime() <= Date.now();
  const today = new Date();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      {/* Quick Schedule Presets */}
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Quick Send-At Presets
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('in2Hours')}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer text-left"
          >
            <div className="font-semibold">Later Today</div>
            <div className="text-[10px] text-slate-400">In 2 hours</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tomorrowMorning')}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer text-left"
          >
            <div className="font-semibold">Tomorrow AM</div>
            <div className="text-[10px] text-slate-400">9:00 AM</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tomorrowAfternoon')}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer text-left"
          >
            <div className="font-semibold">Tomorrow PM</div>
            <div className="text-[10px] text-slate-400">2:00 PM</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('nextMonday')}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer text-left"
          >
            <div className="font-semibold">Next Monday</div>
            <div className="text-[10px] text-slate-400">9:00 AM</div>
          </button>
        </div>
      </div>

      {/* Calendar Grid & Time Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* Calendar Picker (7 cols) */}
        <div className="sm:col-span-7 bg-white border border-slate-200 rounded-lg p-3">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
              }
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
              }
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-[10px] font-semibold text-slate-400 py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty_${idx}`} className="h-7" />;
              }
              const disabled = isBeforeToday(day);
              const selected = isSameDay(day, value);
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-full rounded-md text-xs transition-all flex items-center justify-center ${
                    disabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : selected
                      ? 'bg-blue-600 text-white font-bold shadow-2xs cursor-pointer'
                      : isToday
                      ? 'border border-blue-400 text-blue-700 font-semibold hover:bg-blue-50 cursor-pointer'
                      : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time & Timezone Controls (5 cols) */}
        <div className="sm:col-span-5 flex flex-col justify-between space-y-3 bg-white border border-slate-200 rounded-lg p-3 h-full">
          <div className="space-y-2.5">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Dispatch Time
              </label>
              <input
                type="time"
                value={timeInputValue}
                onChange={handleTimeInputChange}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50"
              />
            </div>

            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Selected Date
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {value.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{timeZoneName}</span>
            </div>
            <div
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isPastTime ? 'text-rose-600' : 'text-blue-600'
              }`}
            >
              {isPastTime && <AlertCircle className="w-3 h-3 shrink-0" />}
              <span>{formatRelativeTime(value)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
