"use client";

import { endOfDay, format, startOfDay, subDays } from "date-fns";
import type React from "react";
import { createContext, useEffect, useState } from "react";
import { convertToLocalTZ } from "@/utils/date";

type DashboardAnalyticsContextProps = {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  isDateRangePickerDisabled: boolean;
  setIsDateRangePickerDisabled: (value: boolean) => void;
  isPending: boolean;
};

const now = new Date();
const defaultStartDate = startOfDay(subDays(now, 6));
const defaultEndDate = endOfDay(now);

// const formatLocalDateTime = (date: Date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0"); // 0-indexed
//   const day = String(date.getDate()).padStart(2, "0");
//   const hours = String(date.getHours()).padStart(2, "0");
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   const seconds = String(date.getSeconds()).padStart(2, "0");
//
//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
// };

const saveDashboardDates = (start: Date, end: Date) => {
  localStorage.setItem(
    "dashboard-startDate",
    format(convertToLocalTZ(startOfDay(start)), "yyyy-MM-dd'T'HH:mm:ss"),
  );
  localStorage.setItem(
    "dashboard-endDate",
    format(convertToLocalTZ(endOfDay(end)), "yyyy-MM-dd'T'HH:mm:ss"),
  );
};

const loadDashboardDates = (): { startDate: Date; endDate: Date } | null => {
  const storedStart = localStorage.getItem("dashboard-startDate");
  const storedEnd = localStorage.getItem("dashboard-endDate");

  if (!storedStart || !storedEnd) return null;

  const start = convertToLocalTZ(new Date(storedStart));
  const end = convertToLocalTZ(new Date(storedEnd));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  return { startDate: start, endDate: end };
};

const DashboardAnalyticsContext = createContext<DashboardAnalyticsContextProps>(
  {
    startDate: defaultStartDate,
    setStartDate: () => {},
    endDate: defaultEndDate,
    setEndDate: () => {},
    isDateRangePickerDisabled: true,
    setIsDateRangePickerDisabled: () => {},
    isPending: false,
  },
);

type DashboardAnalyticsProviderProps = {
  children: React.ReactNode;
};

const DashboardAnalyticsProvider = ({
  children,
}: DashboardAnalyticsProviderProps) => {
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(defaultEndDate);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [isDateRangePickerDisabled, setIsDateRangePickerDisabled] =
    useState(true);

  useEffect(() => {
    const stored = loadDashboardDates();
    if (stored) {
      setStartDate(stored.startDate);
      setEndDate(stored.endDate);
    }
    setIsPending(false);
  }, []);

  useEffect(() => {
    saveDashboardDates(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <DashboardAnalyticsContext.Provider
      value={{
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isDateRangePickerDisabled,
        setIsDateRangePickerDisabled,
        isPending,
      }}
    >
      {children}
    </DashboardAnalyticsContext.Provider>
  );
};

export { DashboardAnalyticsProvider, DashboardAnalyticsContext };
