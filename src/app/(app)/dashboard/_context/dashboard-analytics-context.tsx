"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { saveUserPreference } from "@/app/(app)/actions";

type Preset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "custom_range";

type DashboardAnalyticsContextProps = {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  preset: Preset;
  setPreset: (preset: Preset) => void;
  isPending: boolean;
  activeSource: "preset" | "picker";
  setActiveSource: (value: "preset" | "picker") => void;
};

const DashboardAnalyticsContext =
  createContext<DashboardAnalyticsContextProps | null>(null);

type DashboardAnalyticsProviderProps = {
  children: React.ReactNode;
  initialStartDate: Date;
  initialEndDate: Date;
  initialPreset: Preset;
  initialActiveSource: "preset" | "picker";
};

const DashboardAnalyticsProvider = ({
  children,
  initialStartDate,
  initialEndDate,
  initialPreset,
  initialActiveSource,
}: DashboardAnalyticsProviderProps) => {
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [preset, setPreset] = useState<Preset>(initialPreset);
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

  const handleSetPreset = (preset: Preset) => {
    setPreset(preset);
    saveUserPreference({ key: "dashboard.preset", value: preset });
    // if (preset !== "custom_range") {
    //   saveUserPreference({ key: "dashboard.preset", value: preset });
    // }
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
        preset,
        setPreset: handleSetPreset,
        isPending: false,
        activeSource,
        setActiveSource: handleSetActiveSource,
      }}
    >
      {children}
    </DashboardAnalyticsContext.Provider>
  );
};

const useDashboardAnalytics = () => {
  const ctx = useContext(DashboardAnalyticsContext);
  if (!ctx)
    throw new Error(
      "useDashboardAnalytics must be used inside DashboardAnalyticsProvider",
    );
  return ctx;
};

export { DashboardAnalyticsProvider, useDashboardAnalytics, type Preset };
