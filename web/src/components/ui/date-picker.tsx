import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { ChevronDownIcon } from 'lucide-react';
import type * as React from 'react';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>;
}

export function DatePicker({
  value,
  onChange,
  placeholder = '选择日期',
  className,
  calendarProps,
}: DatePickerProps) {
  const date = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!value}
            className={`w-full h-8 justify-between text-left text-[13px] font-normal data-[empty=true]:text-stone/60 ${className ?? ''}`}
          >
            {date ? format(date, 'PPP', { locale: zhCN }) : placeholder}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) onChange(format(d, 'yyyy-MM-dd'));
          }}
          defaultMonth={date ?? new Date()}
          locale={zhCN}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}
