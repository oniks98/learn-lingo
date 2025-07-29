// src/components/calendar/date-time-picker.tsx
'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/calendar/button';
import { Calendar } from '@/components/calendar/calendar';
import { Input } from '@/components/calendar/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/calendar/popover';

interface DateTimePickerProps {
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  error?: string;
  disablePastDates?: boolean;
  defaultTime?: string;
}

export function DateTimePicker({
  value,
  onChange,
  error,
  disablePastDates = false,
  defaultTime = '10:00',
}: DateTimePickerProps) {
  const t = useTranslations('dateTimePicker');
  const locale = useLocale();

  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value,
  );
  const [selectedTime, setSelectedTime] = React.useState<string>(() => {
    if (value) {
      // Используем локальное время без конвертации в UTC
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return defaultTime;
  });

  // Sync with external value changes
  React.useEffect(() => {
    setSelectedDate(value);
    if (value) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
  }, [value]);

  // Combine date and time into a single Date object (сохраняем локальное время)
  const combineDateTime = (
    date: Date | undefined,
    time: string,
  ): Date | undefined => {
    if (!date) return undefined;

    const [hours, minutes] = time.split(':').map(Number);

    // Создаем дату из строки в формате YYYY-MM-DD HH:MM для избежания проблем с часовыми поясами
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Используем формат без указания часового пояса, чтобы интерпретировалось как локальное время
    return new Date(`${year}-${month}-${day}T${timeStr}:00`);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setOpen(false);

    const combined = combineDateTime(date, selectedTime);
    onChange?.(combined);
  };

  // Handle time change
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;
    setSelectedTime(time);

    const combined = combineDateTime(selectedDate, time);
    onChange?.(combined);
  };

  // Filter past dates if needed
  const isDateDisabled = (date: Date) => {
    if (!disablePastDates) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
  };

  // Format date based on locale
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <div className="flex flex-col gap-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-35 justify-between font-normal"
              >
                {selectedDate ? formatDate(selectedDate) : t('bookingDate')}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
                disabled={disablePastDates ? isDateDisabled : undefined}
                classNames={{
                  day: 'data-[selected-single=true]:bg-yellow-400 data-[selected-single=true]:text-black data-[selected-single=true]:hover:bg-yellow-500',
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-3">
          <Input
            type="time"
            id="time-picker"
            value={selectedTime}
            onChange={handleTimeChange}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>

      {error && <p className="px-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
