import type { Metadata } from "next";
import { Inter, Outfit, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { CanvasSafeArc } from "@/lib/canvas-safe-arc";
import { TooltipProvider } from "@/components/ui/tooltip";
import { loadAppConfig } from "@/lib/config-loader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const appConfig = loadAppConfig();

export const metadata: Metadata = {
  title: appConfig.name ?? "Convergio Frontend Framework",
  description: appConfig.description ?? "Convergio Frontend Framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme={appConfig.defaultTheme}
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${barlowCondensed.variable} h-full antialiased ${appConfig.defaultTheme !== "light" ? "dark" : ""}`}
      >
      <head>
        <ThemeScript storageKey={appConfig.themeStorageKey} />
      </head>
      <body className="min-h-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider
          defaultTheme={appConfig.defaultTheme}
          storageKey={appConfig.themeStorageKey}
        >
          <CanvasSafeArc />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
