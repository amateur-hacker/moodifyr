"use client";

import Link from "next/link";
import { SignInButton } from "@/app/(app)/_components/signin-button";
import { UserMenu } from "@/app/(app)/_components/user-menu";
import { useUser } from "@/app/(app)/_context/user-context";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const user = useUser();

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-background/90 text-foreground gap-5 fixed top-0 inset-x-0 z-[50] backdrop-blur-md">
      <div className="flex gap-1.5">
        <SidebarTrigger className="cursor-pointer" />
        <Link href="/" className="text-2xl font-bold font-logo">
          Moodifyr
        </Link>
      </div>

      <div className="flex items-center gap-4 justify-end">
        {/* <ThemeSwitcher /> */}
        {user ? <UserMenu user={user} /> : <SignInButton />}
      </div>
    </nav>
  );
};

export { Navbar };
