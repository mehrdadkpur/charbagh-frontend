"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Music2, X } from "lucide-react";
import Link from "next/link";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <div dir="rtl" className="min-h-screen overflow-x-clip bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
      <div className="hidden min-h-screen md:flex">
        <aside className="sticky top-0 h-screen shrink-0">
          <DashboardSidebar />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-40 border-b border-gray-200/80 bg-gray-50/90 px-5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 lg:px-8">
            <DashboardHeader />
          </div>
          <main className="min-w-0">{children}</main>
        </div>
      </div>

      <div className="min-h-screen md:hidden">
        <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-gray-200/80 bg-white/95 px-3 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 sm:px-5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="باز کردن منوی مدیریت"
            aria-expanded={mobileMenuOpen}
            aria-controls="dashboard-mobile-sidebar"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Menu size={23} />
          </button>
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-elf text-white">
              <Music2 size={20} />
            </span>
            <span className="truncate text-sm font-extrabold text-gray-900 dark:text-white">داشبورد چهارباغ</span>
          </Link>
          <div className="shrink-0 [&>section]:!pt-0 [&>section]:!pl-0 [&>section]:!justify-end [&>section>div]:!gap-1">
            <DashboardHeader />
          </div>
        </header>
        <main className="min-w-0">{children}</main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            aria-label="بستن منوی مدیریت"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-gray-950/55 backdrop-blur-[2px]"
          />
          <aside
            id="dashboard-mobile-sidebar"
            className="absolute inset-y-0 right-0 z-10 h-full w-[min(18rem,88vw)] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="بستن منو"
              className="absolute left-3 top-3 z-20 flex size-9 items-center justify-center rounded-xl bg-white/90 text-gray-700 shadow-sm hover:bg-white dark:bg-gray-900/90 dark:text-gray-200"
            >
              <X size={19} />
            </button>
            <DashboardSidebar />
          </aside>
        </div>
      )}
    </div>
  );
}
