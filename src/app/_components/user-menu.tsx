"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOutUser } from "@/app/actions";
import { ButtonLoader } from "@/components/button-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { authClient } from "@/lib/auth-client";

type UserMenuProps = {
  session: typeof authClient.$Infer.Session;
};
const UserMenu = ({ session }: UserMenuProps) => {
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      window.location.reload();
      // router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 focus:outline-none cursor-pointer"
          type="button"
          title="Open User Menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                session?.user?.image ||
                "https://res.cloudinary.com/ahcloud/image/upload/v1747277562/images/default-profile_bpnjdl_dzyvud.png"
              }
              alt={session.user.name}
            />
            <AvatarFallback>
              {session.user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Manage account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <ButtonLoader loadingText="Signing out..." />
          ) : (
            <>
              <LogOut size={16} />
              <span>Log Out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UserMenu };
