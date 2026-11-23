import type { Metadata } from "next";
import React from "react";
import Navigation from "../ui/main-page/Navigation";

export const metadata: Metadata = {
  title: "پروفایل کاربر",
  description: "موسیقی هنر برتر",
};

export default function ProfileLayout({children,}: Readonly<{ children: React.ReactNode}>) {
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 ">
      <Navigation/>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
