'use client'

import Link from "next/link";
import Profile from "@/app/ui/components/ProfileNav";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/courses", label: "دوره‌ها" },
    { href: "/teachers", label: "مدرسین" },
    { href: "/instruments", label: "سازشناسی" },
    { href: "/galleries", label: "گالری" },
    { href: "/blogs", label: "بلاگ" },
    { href: "/songs", label: "موسیقی" },
    { href: "/about", label: "درباره ما" },
  ];

  return (
    <header className="hidden md:flex items-center justify-between w-full px-6 py-3">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-x-2">
        <Image
          width={60}
          height={60}
          src="/images/logo.png"
          alt="logo"
          className="w-auto h-auto"
        />
      </Link>

      {/* Navigation Links */}
      <nav className="flex items-center gap-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-2 py-1 text-sm lg:text-base font-medium transition-colors duration-200 
              ${pathname.startsWith(item.href)
                ? "text-mango dark:text-mango-900"
                : "text-gray-900 dark:text-gray-300 hover:text-mango dark:hover:text-mango"}
            `}
          >
            {item.label}
            {/* underline indicator like Microsoft */}
            {pathname.startsWith(item.href) && (
              <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-mango rounded"></span>
            )}
          </Link>
        ))}
      </nav>

      {/* Profile / Account */}
      <Profile />
    </header>
  );
};

export default Navigation;
