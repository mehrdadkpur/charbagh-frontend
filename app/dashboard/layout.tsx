import type { Metadata } from "next";
import React from "react";

import DashboardSidebar from "../ui/components/DashboardSidebar";
import DashboardHeader from "../ui/components/DashboardHeader";
import DashboardAuthGuard from "../ui/components/DashboardAuthGuard";

export const metadata: Metadata = {
  title: "داشبورد مدیر",
  description: "موسیقی هنر برتر",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardAuthGuard>
      <div
        dir="rtl"
        className="hidden md:flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50"
      >
        <aside className="w-64 bg-gray-900 text-white">
          <DashboardSidebar />
        </aside>

        <main className="flex-1 px-12 py-6">
          <DashboardHeader />
          {children}
        </main>
      </div>
    </DashboardAuthGuard>
  );
}