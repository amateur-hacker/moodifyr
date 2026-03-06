import { endOfDay, startOfDay, subDays } from "date-fns";
import { Dashboard } from "@/app/(app)/dashboard/_components/dashboard";
import {
  DashboardAnalyticsProvider,
  type Preset,
} from "@/app/(app)/dashboard/_context/dashboard-analytics-context";
import { getUserAllPreferences, getUserSession } from "@/app/(app)/queries";
import { convertToLocalTZ } from "@/lib/utils";

export default async function DashboardPage() {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full">
        <h3 className="text-lg">Please sign in to see your dashboard.</h3>
      </div>
    );
  }

  const prefs = (await getUserAllPreferences()) ?? {};

  const now = new Date();
  const defaultStartDate = startOfDay(subDays(now, 6));
  const defaultEndDate = endOfDay(now);

  const initialStartDate = prefs["dashboard.startDate"]
    ? convertToLocalTZ(new Date(prefs["dashboard.startDate"] as string))
    : defaultStartDate;

  const initialEndDate = prefs["dashboard.endDate"]
    ? convertToLocalTZ(new Date(prefs["dashboard.endDate"] as string))
    : defaultEndDate;

  const initialActiveSource =
    (prefs["dashboard.activeSource"] as "preset" | "picker" | undefined) ??
    "preset";

  const initialPreset =
    (prefs["dashboard.preset"] as Preset | undefined) ?? "last_7_days";

  return (
    <DashboardAnalyticsProvider
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
      initialActiveSource={initialActiveSource}
      initialPreset={initialPreset}
    >
      <Dashboard />
    </DashboardAnalyticsProvider>
  );
}
