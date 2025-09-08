import { Dashboard } from "@/app/_components/dashboard";
import { getServerSession } from "./_actions";

export default async function HomePage() {
  const session = (await getServerSession())?.session ?? null;
  return <Dashboard session={session} />;
}
