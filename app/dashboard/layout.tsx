import type { Metadata } from "next";
import React from "react";
import DashboardAuthGuard from "../ui/components/DashboardAuthGuard";
import DashboardShell from "../ui/components/DashboardShell";

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
      <DashboardShell>{children}</DashboardShell>
    </DashboardAuthGuard>
  );
}
