"use client";

// import { LogOut, User } from "lucide-react";
// import Link from "next/link";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { signOutUser } from "@/app/(app)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import type { auth } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher";

type UserMenuProps = {
  user: typeof auth.$Infer.Session.user;
};
const UserMenu = ({ user }: UserMenuProps) => {
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
          className="flex items-center gap-2 cursor-pointer"
          type="button"
          title="Open User Menu"
          suppressHydrationWarning
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                user?.image ||
                "https://res.cloudinary.com/ahcloud/image/upload/v1747277562/images/default-profile_bpnjdl_dzyvud.png"
              }
              alt={user.name}
            />
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* <DropdownMenuLabel>Manage account</DropdownMenuLabel> */}

        <div className="flex flex-col items-center">
          <div className="flex gap-1.5 px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  user?.image ||
                  "https://res.cloudinary.com/ahcloud/image/upload/v1747277562/images/default-profile_bpnjdl_dzyvud.png"
                }
                alt={user.name}
              />
              <AvatarFallback>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <DropdownMenuLabel className="truncate">
              {user.name}
            </DropdownMenuLabel>
          </div>

          <ThemeSwitcher />
        </div>

        <DropdownMenuSeparator />

        {/* <DropdownMenuItem> */}
        {/*   <ThemeSwitcher */}
        {/*     defaultValue="system" */}
        {/*     onChange={setTheme} */}
        {/*     value={theme} */}
        {/*   /> */}
        {/*   <span>Theme</span> */}
        {/* </DropdownMenuItem> */}
        {/* <DropdownMenuItem asChild> */}
        {/*   <Link */}
        {/*     href="/profile" */}
        {/*     className="flex items-center gap-2 cursor-pointer" */}
        {/*   > */}
        {/*     <User className="h-4 w-4" /> */}
        {/*     <span>Profile</span> */}
        {/*   </Link> */}
        {/* </DropdownMenuItem> */}

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              Signing out
            </div>
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
