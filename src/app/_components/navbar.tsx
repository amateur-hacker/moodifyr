import Link from "next/link";
import { FloatSearchSongForm } from "@/app/_components/float-search-song-form";
import { SearchSongForm } from "@/app/_components/search-song-form";
import { SignInButton } from "@/app/_components/signin-button";
import { UserMenu } from "@/app/_components/user-menu";
import { getUserSession } from "@/app/queries";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = async () => {
  const session = (await getUserSession()) ?? null;

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-background/90 text-foreground shrink-0 gap-5 fixed top-0 inset-x-0 z-[50] backdrop-blur-md">
      <div className="flex-1 flex gap-1.5">
        <SidebarTrigger className="cursor-pointer" />
        <Link
          href="/"
          className="text-xl font-bold hover:opacity-80 transition-opacity"
        >
          Moodifyr
        </Link>
      </div>

      <div className="max-w-2xl w-full relative hidden sm:block">
        <SearchSongForm />
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className="block sm:hidden">
          <FloatSearchSongForm />
        </div>
        {session ? <UserMenu session={session} /> : <SignInButton />}
      </div>
    </nav>
  );
};

export { Navbar };
