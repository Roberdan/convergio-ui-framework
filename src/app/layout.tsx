import type { Metadata } from "next";
import { Inter, Outfit, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShellWrapper } from "@/components/shell/shell-wrapper";
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

export const metadata: Metadata = {
  title: "Convergio",
  description: "Convergio Frontend — operational product shell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="navy"
      className={`${inter.variable} ${outfit.variable} ${barlowCondensed.variable} h-full antialiased dark`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full">
        <ThemeProvider defaultTheme="navy">
          <TooltipProvider>
            <ShellWrapper>{children}</ShellWrapper>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
