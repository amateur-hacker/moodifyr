import { Dashboard } from "@/app/dashboard/_components/dashboard";
import { getUserSession } from "@/app/queries";
import { DashboardAnalyticsProvider } from "./_context/dashboard-analytics-context";

export default async function DashboardPage() {
  const session = (await getUserSession()) ?? null;

  if (!session) {
    return (
      <div className="mt-15 p-4">
        <h3 className="text-lg">Please sign in to see your dashboard.</h3>
      </div>
    );
  }

  return (
    <DashboardAnalyticsProvider>
      <Dashboard />
    </DashboardAnalyticsProvider>
  );
}
