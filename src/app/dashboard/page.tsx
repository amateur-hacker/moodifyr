import { endOfDay, startOfDay, subDays } from "date-fns";
import { Dashboard } from "@/app/dashboard/_components/dashboard";
import { getUserAllPreferences, getUserSession } from "@/app/queries";
import { DashboardAnalyticsProvider } from "./_context/dashboard-analytics-context";

export default async function DashboardPage() {
  const session = (await getUserSession()) ?? null;

  if (!session) {
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
    ? new Date(prefs["dashboard.startDate"] as string)
    : defaultStartDate;

  const initialEndDate = prefs["dashboard.endDate"]
    ? new Date(prefs["dashboard.endDate"] as string)
    : defaultEndDate;

  const initialActiveSource =
    (prefs["dashboard.activeSource"] as "preset" | "picker" | undefined) ??
    "preset";

  return (
    <DashboardAnalyticsProvider
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
      initialActiveSource={initialActiveSource}
    >
      <Dashboard />
    </DashboardAnalyticsProvider>
  );
}
