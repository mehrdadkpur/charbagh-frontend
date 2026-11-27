"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsBlog } from "@/lib/contentTypes";

const statusLabels: Record<number, string> = { 1: "پیش‌نویس", 2: "منتشرشده", 3: "بایگانی‌شده" };

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<CmsBlog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<CmsBlog[]>("/api/Blogs")
      .then(setBlogs)
      .catch((error) => toast.error(error instanceof Error ? error.message : "دریافت مقالات ناموفق بود."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => blogs.filter((blog) =>
    `${blog.title} ${blog.firstName} ${blog.lastName}`.toLowerCase().includes(search.toLowerCase())
  ), [blogs, search]);

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-7xl space-y-5 px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">مدیریت مقالات</h1>
        <Link href="/dashboard/blogs/create" className="rounded-xl bg-blue-600 px-5 py-3 text-white">ایجاد مقاله</Link>
      </div>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی عنوان یا نویسنده" className="w-full rounded-xl border bg-transparent p-3" />
      {loading ? (
        <p className="py-10 text-center">در حال دریافت مقالات...</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-gray-500">مقاله‌ای پیدا نشد.</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((blog) => (
              <article
                key={blog.id}
                className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <h2 className="min-w-0 flex-1 break-words text-sm font-bold leading-6 text-gray-900 dark:text-white">
                    {blog.title}
                  </h2>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {statusLabels[blog.status] ?? "نامشخص"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <p className="break-words">نویسنده: {blog.firstName} {blog.lastName}</p>
                  <p>تاریخ ایجاد: {new Date(blog.createdAt).toLocaleDateString("fa-IR")}</p>
                </div>
                <Link
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  href={`/dashboard/blogs/${blog.id}`}
                >
                  مشاهده مقاله
                </Link>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3 text-right">عنوان</th>
                  <th className="p-3 text-right">نویسنده</th>
                  <th className="p-3 text-right">تاریخ ایجاد</th>
                  <th className="p-3 text-right">وضعیت</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((blog) => (
                  <tr key={blog.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="max-w-[320px] break-words p-3 font-semibold">{blog.title}</td>
                    <td className="p-3">{blog.firstName} {blog.lastName}</td>
                    <td className="whitespace-nowrap p-3">{new Date(blog.createdAt).toLocaleDateString("fa-IR")}</td>
                    <td className="whitespace-nowrap p-3">{statusLabels[blog.status] ?? "نامشخص"}</td>
                    <td className="p-3 text-center">
                      <Link className="inline-flex min-h-9 items-center rounded-lg bg-emerald-700 px-3 py-2 text-white" href={`/dashboard/blogs/${blog.id}`}>
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
