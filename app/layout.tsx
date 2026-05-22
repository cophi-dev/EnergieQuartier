import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/app/components/layout/AppHeader";
import { AppFooter } from "@/app/components/layout/AppFooter";
import { BRAND } from "@/app/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} – Konzeptstudien für dezentrale Energie`,
  description: BRAND.slogan,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen antialiased bg-background`}
      >
        <TooltipProvider>
          <AppHeader />
          <main>{children}</main>
          <AppFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
