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
      {loading ? <p className="py-10 text-center">در حال دریافت مقالات...</p> : filtered.length === 0 ? <p className="py-10 text-center text-gray-500">مقاله‌ای پیدا نشد.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800"><tr>
              <th className="p-3 text-right">عنوان</th><th className="p-3 text-right">نویسنده</th><th className="p-3 text-right">تاریخ ایجاد</th><th className="p-3 text-right">وضعیت</th><th className="p-3">عملیات</th>
            </tr></thead>
            <tbody>{filtered.map((blog) => (
              <tr key={blog.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 font-semibold">{blog.title}</td>
                <td className="p-3">{blog.firstName} {blog.lastName}</td>
                <td className="p-3">{new Date(blog.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="p-3">{statusLabels[blog.status] ?? "نامشخص"}</td>
                <td className="p-3 text-center"><Link className="rounded-lg bg-emerald-700 px-3 py-2 text-white" href={`/dashboard/blogs/${blog.id}`}>مشاهده</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
