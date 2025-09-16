"use client";

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { use, useEffect, useId, useState } from "react";
import { DashboardAnalyticsContext } from "@/app/dashboard/_context/dashboard-analytics-context";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertToLocalTZ } from "@/lib/utils";

const getDefaultPreset = ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  const now = convertToLocalTZ(new Date());

  if (
    isSameDay(startDate, startOfDay(now)) &&
    isSameDay(endDate, endOfDay(now))
  )
    return "today";
  if (
    isSameDay(startDate, startOfDay(subDays(now, 1))) &&
    isSameDay(endDate, endOfDay(subDays(now, 1)))
  )
    return "yesterday";
  if (
    isSameDay(startDate, startOfDay(subDays(now, 6))) &&
    isSameDay(endDate, endOfDay(now))
  )
    return "last_7_days";
  if (
    isSameDay(startDate, startOfDay(subDays(now, 29))) &&
    isSameDay(endDate, endOfDay(now))
  )
    return "last_30_days";
  if (
    isSameDay(startDate, startOfWeek(now, { weekStartsOn: 0 })) &&
    isSameDay(endDate, endOfDay(now))
  )
    return "this_week";
  if (
    isSameDay(startDate, startOfWeek(subDays(now, 7), { weekStartsOn: 0 })) &&
    isSameDay(endDate, endOfWeek(subDays(now, 7), { weekStartsOn: 0 }))
  )
    return "last_week";
  if (
    isSameDay(startDate, startOfMonth(now)) &&
    isSameDay(endDate, endOfDay(now))
  )
    return "this_month";
  if (
    isSameDay(startDate, startOfMonth(subDays(now, now.getDate()))) &&
    isSameDay(endDate, endOfMonth(subDays(now, now.getDate())))
  )
    return "last_month";
  if (
    isSameDay(startDate, startOfYear(now)) &&
    isSameDay(endDate, endOfDay(now))
  )
    return "this_year";
  if (
    isSameDay(startDate, startOfYear(new Date(now.getFullYear() - 1, 0, 1))) &&
    isSameDay(endDate, endOfYear(new Date(now.getFullYear() - 1, 0, 1)))
  )
    return "last_year";

  return "custom_range";
};

const DateRangePresetSelect = () => {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    activeSource,
    setActiveSource,
    isPending,
  } = use(DashboardAnalyticsContext);
  const [selectedPreset, setSelectedPreset] = useState(
    getDefaultPreset({ startDate, endDate }),
  );

  const isDateRangePickerDisabled = activeSource === "preset";

  useEffect(() => {
    if (!startDate || !endDate || isPending) {
      return;
    }
    if (isDateRangePickerDisabled) {
      setSelectedPreset(getDefaultPreset({ startDate, endDate }));
    } else {
      setSelectedPreset("custom_range");
    }
  }, [startDate, endDate, isDateRangePickerDisabled, isPending]);

  const handleSelectChange = (value: string) => {
    setSelectedPreset(value);
    const now = convertToLocalTZ(new Date());

    let start: Date | null = null;
    let end: Date | null = null;

    switch (value) {
      case "today":
        start = startOfDay(now);
        end = endOfDay(now);
        break;

      case "yesterday":
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;

      case "last_7_days":
        start = startOfDay(subDays(now, 6));
        end = endOfDay(now);
        break;

      case "last_30_days":
        start = startOfDay(subDays(now, 29));
        end = endOfDay(now);
        break;

      case "this_week":
        start = startOfWeek(now, { weekStartsOn: 0 }); // Sunday start
        end = endOfDay(now);
        break;

      case "last_week":
        start = startOfWeek(subDays(now, 7), { weekStartsOn: 0 });
        end = endOfWeek(subDays(now, 7), { weekStartsOn: 0 });
        break;

      case "this_month":
        start = startOfMonth(now);
        end = endOfDay(now);
        break;

      case "last_month":
        start = startOfMonth(subDays(now, now.getDate()));
        end = endOfMonth(subDays(now, now.getDate()));
        break;

      case "this_year":
        start = startOfYear(now);
        end = endOfDay(now);
        break;

      case "last_year":
        start = startOfYear(new Date(now.getFullYear() - 1, 0, 1));
        end = endOfYear(new Date(now.getFullYear() - 1, 0, 1));
        break;

      case "custom_range":
        setActiveSource("picker");
        return;

      default:
        return;
    }

    if (start && end) {
      setStartDate(start);
      setEndDate(end);
      setActiveSource("preset");
    }
  };

  const groupedPresetOptions = [
    {
      group: "General",
      options: [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 Days", value: "last_7_days" },
        { label: "Last 30 Days", value: "last_30_days" },
      ],
    },
    {
      group: "Weekly",
      options: [
        { label: "This Week", value: "this_week" },
        { label: "Last Week", value: "last_week" },
      ],
    },
    {
      group: "Monthly",
      options: [
        { label: "This Month", value: "this_month" },
        { label: "Last Month", value: "last_month" },
      ],
    },
    {
      group: "Yearly",
      options: [
        { label: "This Year", value: "this_year" },
        { label: "Last Year", value: "last_year" },
      ],
    },
    {
      group: "Custom",
      options: [{ label: "Custom Range", value: "custom_range" }],
    },
  ];

  const id = useId();

  return (
    <Select value={selectedPreset} onValueChange={handleSelectChange}>
      <SelectTrigger
        id={id}
        className="w-auto min-w-48 max-w-full cursor-pointer"
      >
        <SelectValue placeholder="Select a preset" />
      </SelectTrigger>
      <SelectContent>
        {groupedPresetOptions.map((group) => (
          <SelectGroup key={group.group}>
            <Label className="font-semibold text-sm">{group.group}</Label>
            {group.options.map((option) => (
              <SelectItem
                className="text-sm cursor-pointer"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export { DateRangePresetSelect };
