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
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/app/(app)/_context/theme-provider";

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
  return (
    <html lang="en" className="system" suppressHydrationWarning>
      <body className={`${fontsVariable} antialiased h-full`}>
        <ThemeProvider>
          <NuqsAdapter>
            <NextTopLoader color={"var(--primary)"} showSpinner={false} />
            <Toaster
              closeButton
              position="top-center"
              className="pointer-events-auto"
            />
            {children}
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
