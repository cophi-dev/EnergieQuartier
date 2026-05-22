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
    <header className="sticky top-0 z-50 border-b border-[#0F172A]/8 glass dark:border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F172A] text-[#06B6D4] shadow-md transition-shadow group-hover:shadow-lg dark:bg-[#06B6D4] dark:text-[#0F172A]">
            <Bolt className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-heading font-semibold tracking-tight text-[#0F172A] dark:text-white">
              {BRAND.name}
            </span>
            <p className="text-[10px] leading-none text-[#06B6D4]">
              {BRAND.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
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
                    ? "bg-[#0F172A] text-white dark:bg-[#06B6D4] dark:text-[#0F172A]"
                    : "text-[#0F172A]/75 hover:bg-[#06B6D4]/10 hover:text-[#0F172A] dark:text-white/90 dark:hover:bg-white/10",
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
            className="rounded-full text-[#0F172A] hover:bg-[#06B6D4]/10 dark:text-white dark:hover:bg-white/10"
            onClick={() => setDark(!dark)}
            aria-label="Theme wechseln"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isLanding && (
            <>
              <ButtonLink
                href="/kontakt"
                variant="outline"
                className="hidden border-[#06B6D4] text-[#0F172A] sm:inline-flex dark:text-[#06B6D4]"
              >
                Kontakt
              </ButtonLink>
              <ButtonLink
                href="/wizard"
                className="hidden bg-[#06B6D4] text-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] sm:inline-flex"
              >
                Neues Projekt
              </ButtonLink>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-[#0F172A] md:hidden dark:text-white"
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
          className="border-t border-[#0F172A]/8 glass px-4 py-3 md:hidden dark:border-white/10"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#06B6D4]/10 dark:text-white"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink
            href="/wizard"
            onClick={() => setMobileOpen(false)}
            className="mt-2 w-full bg-[#06B6D4] text-[#0F172A]"
          >
            Neues Projekt starten
          </ButtonLink>
        </motion.nav>
      )}
    </header>
  );
}
