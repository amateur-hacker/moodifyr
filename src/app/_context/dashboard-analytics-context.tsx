"use client";

import type React from "react";
import { createContext, useState } from "react";
import { startOfDay, endOfDay, subDays } from "date-fns";

type DashboardAnalyticsContextProps = {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  isDateRangePickerDisabled: boolean;
  setIsDateRangePickerDisabled: (value: boolean) => void;
};

const now = new Date();
const defaultStart = startOfDay(subDays(now, 6));
const defaultEnd = endOfDay(now);

const DashboardAnalyticsContext = createContext<DashboardAnalyticsContextProps>(
  {
    startDate: defaultStart,
    setStartDate: () => {},
    endDate: defaultEnd,
    setEndDate: () => {},
    isDateRangePickerDisabled: true,
    setIsDateRangePickerDisabled: () => {},
  },
);

type DashboardAnalyticsProviderProps = {
  children: React.ReactNode;
};

const DashboardAnalyticsProvider = ({
  children,
}: DashboardAnalyticsProviderProps) => {
  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);
  const [isDateRangePickerDisabled, setIsDateRangePickerDisabled] =
    useState(true);

  return (
    <DashboardAnalyticsContext.Provider
      value={{
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isDateRangePickerDisabled,
        setIsDateRangePickerDisabled,
      }}
    >
      {children}
    </DashboardAnalyticsContext.Provider>
  );
};

export { DashboardAnalyticsProvider, DashboardAnalyticsContext };
