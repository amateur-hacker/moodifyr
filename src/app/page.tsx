import Link from "next/link";
import { getUserSession } from "@/app/queries";

export default async function HomePage() {
  const session = (await getUserSession()) ?? null;

  if (!session) {
    return (
      <div className="mt-15 p-4">
        <h3 className="text-lg">Please sign in to see your home page.</h3>
      </div>
    );
  }

  return (
    <div className="mt-15 p-4">
      <h1 className="text-4xl">Home Page</h1>
      <Link href="/dashboard" className="cursor-pointer hover:text-primary">
        <h2 className="text-xl">Dashboard Page</h2>
      </Link>
    </div>
  );
}
