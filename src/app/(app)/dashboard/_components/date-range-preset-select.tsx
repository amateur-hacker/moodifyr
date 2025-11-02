"use client";

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { useEffect, useId } from "react";
import {
  type Preset,
  useDashboardAnalytics,
} from "@/app/(app)/dashboard/_context/dashboard-analytics-context";
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

const DateRangePresetSelect = () => {
  const {
    setStartDate,
    setEndDate,
    activeSource,
    setActiveSource,
    isPending,
    preset,
    setPreset,
  } = useDashboardAnalytics();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (isPending) {
      return;
    }
    if (activeSource === "preset") {
      setPreset(preset);
    } else {
      setPreset("custom_range");
    }
  }, [activeSource]);

  const handleSelectChange = (value: Preset) => {
    setPreset(value);
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
        start = startOfWeek(now, { weekStartsOn: 0 });
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
    <Select value={preset} onValueChange={handleSelectChange}>
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
