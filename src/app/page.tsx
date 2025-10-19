import { LucideHeartPulse, LucideHistory, Search, Smile } from "lucide-react";
import Link from "next/link";
import { getUserSession } from "@/app/queries";
import { Typography } from "@/components/ui/typography";

const quickLinks = [
  {
    href: "/search",
    label: "Search",
    Icon: Search,
  },
  {
    href: "/favourites",
    label: "Favourites",
    Icon: LucideHeartPulse,
  },
  {
    href: "/moodlists",
    label: "Moodlists",
    Icon: Smile,
  },
  {
    href: "/history",
    label: "History",
    Icon: LucideHistory,
  },
];
export default async function HomePage() {
  const session = (await getUserSession()) ?? null;

  if (!session) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your home page.
        </Typography>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] place-items-start gap-5">
      {/* <h1 className="text-4xl">Home Page</h1> */}
      {/* <Link */}
      {/*   href="/dashboard" */}
      {/*   className="cursor-pointer hover:text-primary inline-block text-xl underline decoration-primary" */}
      {/* > */}
      {/*   Dashboard Page */}
      {/* </Link> */}
      {quickLinks.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className="cursor-pointer w-max flex flex-col gap-2 text-center"
        >
          <div className="size-32 sm:size-40 bg-gradient-to-b from-primary via-secondary to-accent rounded-md flex justify-center items-center">
            <Icon className="size-16 sm:size-20" />
          </div>
          <Typography variant="large">{label}</Typography>
        </Link>
      ))}
    </div>
  );
}
