import type { Metadata, Viewport } from "next";
import {
  Aladin,
  Geist,
  Geist_Mono,
  Lora,
  Mystery_Quest,
  Press_Start_2P,
} from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Navbar } from "@/app/_components/navbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AppSidebar } from "@/app/_components/app-sidebar";
import { GlobalSongPlayer } from "@/app/_components/global-song-player";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FavouriteProvider } from "@/app/_context/favourite-context";
import { UserProvider } from "./_context/user-context";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { SelectUserModel } from "@/db/schema/auth";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// import { SplashCursor } from "@/components/splash-cursor";
// import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const loraSerif = Lora({
  variable: "--font-lora-serif",
  subsets: ["latin"],
});

const pressStart2PRetro = Press_Start_2P({
  variable: "--font-press_start_2p-retro",
  subsets: ["latin"],
  weight: ["400"],
});

const mysteryQuestPlayful = Mystery_Quest({
  variable: "--font-mystery_quest-playful",
  subsets: ["latin"],
  weight: ["400"],
});

const aladinPlayful = Aladin({
  variable: "--font-aladin-playful",
  subsets: ["latin"],
  weight: ["400"],
});

const fonts = [
  geistSans,
  geistMono,
  loraSerif,
  pressStart2PRetro,
  mysteryQuestPlayful,
  aladinPlayful,
];
const fontsVariable = fonts.map((font) => font.variable).join(" ");

export const metadata: Metadata = {
  title: "Moodifyr | Music That Matches Your Mood",
  description:
    "Create mood-based playlists, track your listening habits, and discover how music shapes your focus, feelings, and daily vibe.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

export const dynamic = "force-dynamic";
export default async function RootLayout({
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
    <html lang="en">
      <body className={`${fontsVariable} antialiased`}>
        <NuqsAdapter>
          <UserProvider user={user}>
            <SidebarProvider defaultOpen={false}>
              <FavouriteProvider>
                <GlobalSongPlayer>
                  <NextTopLoader color={"var(--primary)"} showSpinner={false} />
                  <Toaster
                    closeButton
                    position="top-center"
                    className="pointer-events-auto"
                  />
                  {/* <SplashCursor /> */}
                  <Navbar />
                  <AppSidebar />
                  <main className="w-full mt-15 px-6 py-4">{children} </main>
                </GlobalSongPlayer>
              </FavouriteProvider>
            </SidebarProvider>
          </UserProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
