"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Building2,
  FileText,
  GraduationCap,
  Music2,
  Users,
  Wallet,
} from "lucide-react";
import StatCard from "@/app/ui/components/DashboardStats";
import { fetchStats } from "@/lib/requests";
import toast from "react-hot-toast";
import { IStats } from "@/lib/types";

const shortcuts = [
  {
    title: "مدیریت کاربران",
    description: "مشاهده و مدیریت حساب‌های کاربری",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "مدیریت مدرسان",
    description: "اطلاعات و پرونده مدرسان",
    href: "/dashboard/teachers",
    icon: GraduationCap,
  },
  {
    title: "هنرجویان",
    description: "مشاهده فهرست و پرونده هنرجویان",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    title: "برنامه‌های آموزشی",
    description: "کلاس‌ها و برنامه‌ریزی آموزشی",
    href: "/dashboard/teaching-plans",
    icon: BookOpen,
  },
  {
    title: "محتوای سایت",
    description: "مقالات، گالری‌ها و مطالب منتشرشده",
    href: "/dashboard/blogs",
    icon: FileText,
  },
  {
    title: "امور مالی",
    description: "فاکتورها، پرداخت‌ها و گزارش‌ها",
    href: "/dashboard/invoices",
    icon: Wallet,
  },
];

export default function DashboardContent() {
  const [stats, setStats] = useState<IStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const data = await fetchStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) toast.error("دریافت آمار داشبورد ناموفق بود.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    { title: "شعبه‌ها", count: stats?.totalBranches, icon: <Building2 size={23} /> },
    { title: "کاربران", count: stats?.totalUsers, icon: <Users size={23} /> },
    { title: "مدرسان", count: stats?.totalTeachers, icon: <GraduationCap size={23} /> },
    { title: "هنرجویان", count: stats?.totalStudents, icon: <Users size={23} /> },
    { title: "کارکنان", count: stats?.totalStaffs, icon: <Users size={23} /> },
    { title: "کتاب‌ها", count: stats?.totalBooks, icon: <BookOpen size={23} /> },
    { title: "مقالات", count: stats?.totalBlogs, icon: <FileText size={23} /> },
    { title: "سازها", count: stats?.totalInstruments, icon: <Music2 size={23} /> },
  ];

  return (
    <div dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-elf to-[#075f54] px-5 py-7 text-white shadow-lg shadow-elf/15 sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
            <Activity size={14} />
            پنل مدیریت چهارباغ
          </span>
          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">به داشبورد مدیریت خوش آمدید</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
            از این بخش می‌توانید به قسمت‌های مختلف سامانه دسترسی داشته باشید و وضعیت کلی آموزشگاه را دنبال کنید.
          </p>
        </div>
        <Music2 aria-hidden="true" className="absolute -left-5 -bottom-10 size-48 rotate-[-18deg] text-white/10 sm:size-64" />
      </section>

      <section aria-labelledby="dashboard-stats-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 id="dashboard-stats-title" className="text-lg font-bold text-gray-900 dark:text-white">خلاصه وضعیت سامانه</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">آمار دریافت‌شده از اطلاعات ثبت‌شده در سامانه</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">آمار کلی</span>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              count={item.count}
              icon={item.icon}
              loading={loading}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="dashboard-shortcuts-title">
        <div className="mb-4">
          <h2 id="dashboard-shortcuts-title" className="text-lg font-bold text-gray-900 dark:text-white">دسترسی سریع</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ورود مستقیم به بخش‌های پرکاربرد مدیریت</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-w-0 items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-elf/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf/50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-elf/50"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-elf/10 text-elf transition-colors group-hover:bg-elf group-hover:text-white dark:bg-elf/15">
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-gray-800 dark:text-gray-100">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{description}</span>
              </span>
              <ArrowLeft size={17} className="shrink-0 text-gray-400 transition-transform group-hover:-translate-x-1 group-hover:text-elf" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
