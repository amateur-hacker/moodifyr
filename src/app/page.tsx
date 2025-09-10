import { Dashboard } from "@/app/_components/dashboard";
import { getServerSession } from "./_actions";

export default async function HomePage() {
  const session = (await getServerSession()) ?? null;

  if (!session) {
    return (
      <div className="mt-15 p-4">
        <h3 className="text-lg">Please sign in to see your dashboard.</h3>
      </div>
    );
  }

  return <Dashboard />;
}
