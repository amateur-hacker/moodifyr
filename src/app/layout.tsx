import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Navbar } from "@/app/_components/navbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { FloatSearchBarProvider } from "@/app/_context/float-search-bar-context";
import { DashboardAnalyticsProvider } from "@/app/dashboard/_context/dashboard-analytics-context";

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
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontsVariable} antialiased`}>
        <FloatSearchBarProvider>
          <DashboardAnalyticsProvider>
            <Navbar />
            <NextTopLoader color={"var(--primary)"} showSpinner={false} />
            <Toaster closeButton richColors position="top-center" />
            {children}
          </DashboardAnalyticsProvider>
        </FloatSearchBarProvider>
      </body>
    </html>
  );
}
