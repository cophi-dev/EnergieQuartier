import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/app/components/layout/AppHeader";
import { AppFooter } from "@/app/components/layout/AppFooter";
import { BRAND } from "@/app/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-[#F5F8FA] dark:bg-[#0A4D68]`}
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
