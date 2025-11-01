"use client";

// import dynamic from "next/dynamic";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// const NextThemesProvider = dynamic(
//   () => import("next-themes").then((e) => e.ThemeProvider),
//   {
//     ssr: false,
//   },
// );

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
