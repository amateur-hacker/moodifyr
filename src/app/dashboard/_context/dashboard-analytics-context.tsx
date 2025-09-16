"use client";

import { endOfDay, format, startOfDay, subDays } from "date-fns";
import type React from "react";
import { createContext, useEffect, useState } from "react";
import { convertToLocalTZ } from "@/lib/utils";

type DashboardAnalyticsContextProps = {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  isPending: boolean;
  activeSource: "preset" | "picker";
  setActiveSource: (value: "preset" | "picker") => void;
};

const now = new Date();
const defaultStartDate = startOfDay(subDays(now, 6));
const defaultEndDate = endOfDay(now);

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

const saveActiveSource = (source: "preset" | "picker") => {
  localStorage.setItem("dashboard-activeSource", source);
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

const loadActiveSource = (): string | null => {
  const source = localStorage.getItem("dashboard-activeSource");
  if (!source) return null;
  return source;
};

const DashboardAnalyticsContext = createContext<DashboardAnalyticsContextProps>(
  {
    startDate: defaultStartDate,
    setStartDate: () => {},
    endDate: defaultEndDate,
    setEndDate: () => {},
    isPending: false,
    activeSource: "preset",
    setActiveSource: () => {},
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
  const [activeSource, setActiveSource] = useState<"preset" | "picker">(
    "preset",
  );

  useEffect(() => {
    const storedDates = loadDashboardDates();
    const storedSource = loadActiveSource();

    if (storedDates) {
      setStartDate(storedDates.startDate);
      setEndDate(storedDates.endDate);
    }

    if (storedSource === "picker" || storedSource === "preset") {
      setActiveSource(storedSource);
    }

    setIsPending(false);
  }, []);

  useEffect(() => {
    saveDashboardDates(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    saveActiveSource(activeSource);
  }, [activeSource]);

  return (
    <DashboardAnalyticsContext.Provider
      value={{
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isPending,
        activeSource,
        setActiveSource,
      }}
    >
      {children}
    </DashboardAnalyticsContext.Provider>
  );
};

export { DashboardAnalyticsProvider, DashboardAnalyticsContext };
