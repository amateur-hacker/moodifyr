import { LucideHeartPulse, LucideHistory } from "lucide-react";
import Link from "next/link";
import { getUserSession } from "@/app/queries";
import { Typography } from "@/components/ui/typography";

export default async function HomePage() {
  const session = (await getUserSession()) ?? null;

  if (!session) {
    return (
      <div className="mt-15 p-4">
        <Typography variant="lead">
          Please sign in to see your home page.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {/* <h1 className="text-4xl">Home Page</h1> */}
      {/* <Link */}
      {/*   href="/dashboard" */}
      {/*   className="cursor-pointer hover:text-primary inline-block text-xl underline decoration-primary" */}
      {/* > */}
      {/*   Dashboard Page */}
      {/* </Link> */}
      <Link
        href="/favourites"
        className="cursor-pointer w-max flex flex-col gap-2 text-center"
      >
        <div className="size-32 sm:size-40 bg-gradient-to-b from-primary via-secondary to-accent rounded-md flex justify-center items-center">
          <LucideHeartPulse className="size-16 sm:size-20" />
        </div>
        <Typography variant="large">Favourites</Typography>
      </Link>
      <Link
        href="/history"
        className="cursor-pointer w-max flex flex-col gap-2 text-center"
      >
        <div className="size-32 sm:size-40 bg-gradient-to-b from-primary via-secondary to-accent rounded-md flex justify-center items-center">
          <LucideHistory className="size-16 sm:size-20" />
        </div>
        <Typography variant="large">History</Typography>
      </Link>
    </div>
  );
}
