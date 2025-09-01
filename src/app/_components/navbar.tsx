"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { ButtonLoader } from "@/components/button-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LogIn } from "lucide-react";

export default function Navbar() {
  const { useSession } = authClient;
  const { data: session } = useSession();

  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-background text-foreground">
      <Link
        href="/"
        className="text-xl font-bold hover:opacity-80 transition-opacity"
      >
        Moodifyr
      </Link>

      <div className="flex items-center gap-4">
        {!session ? (
          <Button
            className="cursor-pointer flex items-center gap-2"
            onClick={async () => {
              try {
                setSigningIn(true);
                await authClient.signIn.social({ provider: "google" });
              } finally {
                setSigningIn(false);
              }
            }}
            disabled={signingIn}
          >
            {signingIn ? (
              <ButtonLoader loadingText="Signing in..." />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
                type="button"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      session.user.image ||
                      "https://res.cloudinary.com/ahcloud/image/upload/v1747277562/images/default-profile_bpnjdl_dzyvud.png"
                    }
                    alt={session.user.name}
                  />
                  <AvatarFallback>{session.user.name}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{session.user.name}</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Manage account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={async () => {
                  try {
                    setSigningOut(true);
                    await authClient.signOut();
                  } finally {
                    setSigningOut(false);
                  }
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>
                  {signingOut ? (
                    <ButtonLoader loadingText="Signing out..." />
                  ) : (
                    "Log Out"
                  )}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
