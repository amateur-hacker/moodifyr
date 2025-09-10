"use client";

import { type CalendarDate, parseDate } from "@internationalized/date";
import { endOfDay, format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { use, useEffect, useState } from "react";
import {
  Button,
  DateRangePicker as DateRangePickerRac,
  Dialog,
  Group,
  Popover,
} from "react-aria-components";
import { DashboardAnalyticsContext } from "@/app/_context/dashboard-analytics-context";
import { RangeCalendar } from "@/components/ui/calendar-rac";
import { DateInput, dateInputStyle } from "@/components/ui/datefield-rac";
import { cn } from "@/lib/utils";
import { convertToLocalTZ } from "@/utils/date";

const DateRangePicker = () => {
  const {
    isDateRangePickerDisabled,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = use(DashboardAnalyticsContext);

  const formatForPicker = (date: Date | null) => {
    if (!date) return null;
    const localDate = convertToLocalTZ(date);
    const str = format(localDate, "yyyy-MM-dd");
    return parseDate(str);
  };
  const [pickerValue, setPickerValue] = useState<{
    start: CalendarDate | null;
    end: CalendarDate | null;
  }>({
    start: formatForPicker(startDate),
    end: formatForPicker(endDate),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!isDateRangePickerDisabled) {
      setPickerValue({
        start: formatForPicker(startDate),
        end: formatForPicker(endDate),
      });
    }
  }, [startDate, endDate, isDateRangePickerDisabled]);

  const handleDateRangeChange: Required<
    React.ComponentProps<typeof DateRangePickerRac>
  >["onChange"] = (value) => {
    if (!value) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    let newStartDate: Date | null = null;
    let newEndDate: Date | null = null;

    if (value.start) {
      newStartDate = startOfDay(
        format(value.start.toDate(timeZone), "yyyy-MM-dd"),
      );
      setStartDate(newStartDate);
    }
    if (value.end) {
      newEndDate = endOfDay(format(value.end.toDate(timeZone), "yyyy-MM-dd"));
      setEndDate(newEndDate);
    }

    setPickerValue({
      start: formatForPicker(newStartDate),
      end: formatForPicker(newEndDate),
    });
  };

  return (
    <DateRangePickerRac
      className="*:not-first:mt-2"
      aria-label="Date Range Picker"
      isDisabled={isDateRangePickerDisabled}
      onChange={handleDateRangeChange}
      // biome-ignore lint/suspicious/noTsIgnore: <_>
      // @ts-ignore:
      value={pickerValue}
    >
      <div className="flex">
        <Group className={cn(dateInputStyle, "pe-9")}>
          <DateInput slot="start" unstyled />
          <span aria-hidden="true" className="text-muted-foreground/70 px-2">
            -
          </span>
          <DateInput slot="end" unstyled />
        </Group>
        <Button className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
          <CalendarIcon size={16} />
        </Button>
      </div>
      <Popover
        className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-md border shadow-lg outline-hidden"
        offset={4}
      >
        <Dialog className="max-h-[inherit] overflow-auto p-2">
          <RangeCalendar />
        </Dialog>
      </Popover>
    </DateRangePickerRac>
  );
};

export { DateRangePicker };
