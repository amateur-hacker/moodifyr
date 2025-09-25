import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Navbar } from "@/app/_components/navbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { GlobalSongPlayer } from "@/app/_components/global-song-player";
import { FloatSearchBarProvider } from "@/app/_context/float-search-bar-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/_components/app-sidebar";
import { cookies } from "next/headers";

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

const fonts = [geistSans, geistMono, loraSerif];
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
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <html lang="en">
      <body className={`${fontsVariable} antialiased`}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <GlobalSongPlayer>
            <FloatSearchBarProvider>
              <Navbar />
              <NextTopLoader color={"var(--primary)"} showSpinner={false} />
              <Toaster closeButton richColors position="top-center" />
              <main className="w-full mt-15 px-6 py-4">
                <AppSidebar />
                {children}
              </main>
            </FloatSearchBarProvider>
          </GlobalSongPlayer>
        </SidebarProvider>
      </body>
    </html>
  );
}
