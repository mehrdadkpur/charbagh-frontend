"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Home, BookOpen, GraduationCap, Guitar, Images, Newspaper, Music2, Info } from "lucide-react";
import ProfileNav from "./ProfileNav";

const links = [
  { href: "/", label: "صفحه اصلی", icon: Home },
  { href: "/courses", label: "دوره‌های آموزشی", icon: BookOpen },
  { href: "/teachers", label: "مدرسین", icon: GraduationCap },
  { href: "/instruments", label: "سازشناسی", icon: Guitar },
  { href: "/galleries", label: "گالری", icon: Images },
  { href: "/blogs", label: "بلاگ و رویدادها", icon: Newspaper },
  { href: "/songs", label: "موسیقی آموزشی", icon: Music2 },
  { href: "/about", label: "درباره ما", icon: Info },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative z-[60] flex h-20 items-center justify-between bg-white px-4 dark:bg-gray-900 md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="باز کردن منوی سایت"
        aria-expanded={open}
        aria-controls="mobile-site-navigation"
        className="flex size-11 items-center justify-center rounded-xl text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf dark:text-white dark:hover:bg-gray-800"
      >
        <Menu size={24} />
      </button>

      <Link href="/" aria-label="صفحه اصلی آموزشگاه موسیقی چهارباغ">
        <Image src="/images/logo.png" width={48} height={48} alt="لوگوی آموزشگاه موسیقی چهارباغ" priority />
      </Link>

      <ProfileNav />

      {open && (
        <>
          <button
            type="button"
            aria-label="بستن منوی سایت"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-black/40"
          />
          <nav
            id="mobile-site-navigation"
            aria-label="ناوبری اصلی"
            className="fixed inset-y-0 right-0 z-[80] w-[min(19rem,85vw)] overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Image src="/images/logo.png" width={42} height={42} alt="" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">آموزشگاه موسیقی</p>
                  <p className="mt-1 text-sm font-bold text-elf dark:text-mango">چهارباغ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن منو"
                className="flex size-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <ul className="space-y-2">
              {links.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-elf/10 text-elf dark:bg-mango/10 dark:text-mango" : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"}`}
                    >
                      <Icon size={19} aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
