import { headers } from "next/headers";
import { AppSidebar } from "@/app/(app)/_components/app-sidebar";
import { GlobalSongPlayer } from "@/app/(app)/_components/global-song-player";
import { Navbar } from "@/app/(app)/_components/navbar";
import { FavouriteProvider } from "@/app/(app)/_context/favourite-context";
import { UserProvider } from "@/app/(app)/_context/user-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { SelectUserModel } from "@/db/schema/auth";
import { auth } from "@/lib/auth";

// import { SplashCursor } from "@/components/splash-cursor";
// import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as SelectUserModel;

  return (
    <UserProvider user={user}>
      <SidebarProvider defaultOpen={false}>
        <FavouriteProvider>
          <GlobalSongPlayer>
            {/* <SplashCursor /> */}
            <Navbar />
            <AppSidebar />
            <main className="w-full h-full pt-19 px-6 pb-4">{children}</main>
          </GlobalSongPlayer>
        </FavouriteProvider>
      </SidebarProvider>
    </UserProvider>
  );
}
