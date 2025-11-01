"use client";

import type React from "react";
import { createContext, useState } from "react";
import { saveUserPreference } from "@/app/(app)/actions";

type DashboardAnalyticsContextProps = {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  isPending: boolean;
  activeSource: "preset" | "picker";
  setActiveSource: (value: "preset" | "picker") => void;
};

const DashboardAnalyticsContext = createContext<DashboardAnalyticsContextProps>(
  {
    startDate: new Date(),
    setStartDate: () => {},
    endDate: new Date(),
    setEndDate: () => {},
    isPending: false,
    activeSource: "preset",
    setActiveSource: () => {},
  },
);

type DashboardAnalyticsProviderProps = {
  children: React.ReactNode;
  initialStartDate: Date;
  initialEndDate: Date;
  initialActiveSource: "preset" | "picker";
};

const DashboardAnalyticsProvider = ({
  children,
  initialStartDate,
  initialEndDate,
  initialActiveSource,
}: DashboardAnalyticsProviderProps) => {
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [activeSource, setActiveSource] = useState<"preset" | "picker">(
    initialActiveSource,
  );

  const handleSetStartDate = (date: Date) => {
    setStartDate(date);
    saveUserPreference({
      key: "dashboard.startDate",
      value: date.toISOString(),
    });
  };

  const handleSetEndDate = (date: Date) => {
    setEndDate(date);
    saveUserPreference({ key: "dashboard.endDate", value: date.toISOString() });
  };

  const handleSetActiveSource = (value: "preset" | "picker") => {
    setActiveSource(value);
    saveUserPreference({ key: "dashboard.activeSource", value });
  };

  return (
    <DashboardAnalyticsContext.Provider
      value={{
        startDate,
        setStartDate: handleSetStartDate,
        endDate,
        setEndDate: handleSetEndDate,
        isPending: false,
        activeSource,
        setActiveSource: handleSetActiveSource,
      }}
    >
      {children}
    </DashboardAnalyticsContext.Provider>
  );
};

export { DashboardAnalyticsProvider, DashboardAnalyticsContext };
