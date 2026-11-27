"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const darkMode = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", darkMode);
    setIsDark(darkMode);
    setReady(true);

    const syncTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("charbagh-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("charbagh-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    setIsDark(nextDark);
    window.dispatchEvent(new Event("charbagh-theme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!ready}
      aria-label={isDark ? "فعال‌کردن حالت روشن" : "فعال‌کردن حالت تاریک"}
      aria-pressed={isDark}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf/50 disabled:cursor-wait dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {isDark ? (
        <Moon size={19} className="text-amber-400" aria-hidden="true" />
      ) : (
        <Sun size={20} className="text-orange-500" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
