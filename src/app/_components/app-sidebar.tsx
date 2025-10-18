"use client";

import {
  Activity,
  // HardDriveDownload,
  HeartPulse,
  History,
  Home,
  Search,
  Settings,
  Smile,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/app/_context/user-context";
import { googleSignInUser } from "@/app/fn";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home, protected: true },
  { title: "Dashboard", url: "/dashboard", icon: Activity, protected: true },
  { title: "Search", url: "/search", icon: Search, protected: false },
  {
    title: "Favourites",
    url: "/favourites",
    icon: HeartPulse,
    protected: true,
  },
  { title: "Moodlists", url: "/moodlists", icon: Smile, protected: true },
  // {
  //   title: "Downloads",
  //   url: "/downloads",
  //   icon: HardDriveDownload,
  //   protected: true,
  // },
  { title: "History", url: "/history", icon: History, protected: true },
  { title: "Settings", url: "/settings", icon: Settings, protected: true },
];

export function AppSidebar() {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [origin, setOrigin] = useState("");

  const handleNavClick = (url: string, isProtected: boolean) => {
    if (isProtected && !user) {
      toast("Sign in to access this page", {
        id: "signin-toast",
        action: {
          label: "Sign In",
          onClick: async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const response = await googleSignInUser({
              callbackURL: url,
              newUserCallbackURL: url,
            });
            if (response?.url) {
              router.push(response?.url);
            }
          },
        },
        duration: 5000,
        className: "pointer-events-auto",
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="h-[3.8rem] px-6 py-3">
        <div className="flex-1 flex gap-1.5 items-center">
          <SidebarTrigger className="cursor-pointer" />
          <Link href="/" className="text-2xl font-bold font-logo">
            Moodifyr
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      onClick={(e) => {
                        const ok = handleNavClick(item.url, item.protected);
                        if (!ok) {
                          e.preventDefault();
                          const queryString = searchParams?.toString();
                          const url = queryString
                            ? `${origin}${pathname}?${queryString}`
                            : `${origin}${pathname}`;

                          router.push(url);
                          return;
                        }
                      }}
                      // className="flex items-center gap-2"
                      className={`flex items-center gap-2 ${
                        item.url === "/"
                          ? pathname === "/"
                            ? "text-primary hover:!text-primary"
                            : "text-foreground"
                          : pathname.startsWith(item.url)
                            ? "text-primary hover:!text-primary"
                            : "text-foreground"
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
