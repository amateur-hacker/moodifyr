import {
  Activity,
  HardDriveDownload,
  HeartPulse,
  History,
  Home,
  Search,
  Settings,
  Smile,
} from "lucide-react";
import Link from "next/link";
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
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Activity,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Favourites",
    url: "/favourites",
    icon: HeartPulse,
  },
  {
    title: "Moodlist",
    url: "/moodlist",
    icon: Smile,
  },
  {
    title: "Downloads",
    url: "/downloads",
    icon: HardDriveDownload,
  },
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="h-[3.8rem] px-6 py-3">
        <div className="flex-1 flex gap-1.5 items-center">
          <SidebarTrigger className="cursor-pointer" />
          <Link
            href="/"
            className="text-xl font-bold hover:opacity-80 transition-opacity"
          >
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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
