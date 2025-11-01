import { Navbar } from "@/app/(app)/_components/navbar";
import { headers } from "next/headers";
import { AppSidebar } from "@/app/(app)/_components/app-sidebar";
import { GlobalSongPlayer } from "@/app/(app)/_components/global-song-player";
import { FavouriteProvider } from "@/app/(app)/_context/favourite-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { SelectUserModel } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { UserProvider } from "@/app/(app)/_context/user-context";

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
            <main className="w-full mt-15 px-6 py-4 pb-[var(--player-height,0px)]">
              {children}
            </main>
          </GlobalSongPlayer>
        </FavouriteProvider>
      </SidebarProvider>
    </UserProvider>
  );
}
