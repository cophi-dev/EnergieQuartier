"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bolt, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { BRAND, NAV_ITEMS } from "@/app/lib/constants";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-[#0A4D68]/10 bg-white/80 backdrop-blur-md dark:bg-[#0A4D68]/95 dark:border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A4D68] text-[#00FFCA] shadow-md group-hover:shadow-lg transition-shadow">
            <Bolt className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold text-[#0A4D68] dark:text-white tracking-tight">
              {BRAND.name}
            </span>
            <p className="text-[10px] text-[#088395] dark:text-[#00FFCA]/80 leading-none">
              HEW Konzeptstudien
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const basePath = item.href.split("#")[0];
            const active =
              pathname === basePath || pathname.startsWith(`${basePath}/`);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#0A4D68] text-white"
                    : "text-[#0A4D68]/80 hover:bg-[#088395]/10 hover:text-[#0A4D68] dark:text-white/90 dark:hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#0A4D68] dark:text-white"
            onClick={() => setDark(!dark)}
            aria-label="Theme wechseln"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isLanding && (
            <ButtonLink
              href="/wizard"
              className="hidden sm:inline-flex bg-[#088395] hover:bg-[#0A4D68] text-white"
            >
              Neues Projekt
            </ButtonLink>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#0A4D68]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-[#0A4D68]/10 bg-white dark:bg-[#0A4D68] px-4 py-3"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#0A4D68] hover:bg-[#088395]/10 dark:text-white"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink
            href="/wizard"
            onClick={() => setMobileOpen(false)}
            className="mt-2 w-full bg-[#088395] text-white"
          >
            Neues Projekt starten
          </ButtonLink>
        </motion.nav>
      )}
    </header>
  );
}
