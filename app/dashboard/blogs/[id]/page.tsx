"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsBlog } from "@/lib/contentTypes";

const statusLabels: Record<number, string> = { 1: "پیش‌نویس", 2: "منتشرشده", 3: "بایگانی‌شده" };

export default function BlogDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [blog, setBlog] = useState<CmsBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setBlog(await apiFetch<CmsBlog>(`/api/Blogs/${id}`)); }
    catch (error) { toast.error(error instanceof Error ? error.message : "دریافت مقاله ناموفق بود."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [id]);

  const changeStatus = async (action: "publish" | "unpublish" | "archive" | "restore") => {
    setBusy(true);
    try {
      const updated = await apiFetch<CmsBlog>(`/api/Blogs/${id}/${action}`, { method: "PATCH" });
      setBlog(updated);
      toast.success("وضعیت مقاله تغییر کرد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود.");
    } finally { setBusy(false); }
  };

  if (loading) return <p className="p-10 text-center">در حال بارگذاری...</p>;
  if (!blog) return <p className="p-10 text-center">مقاله پیدا نشد.</p>;

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-4xl space-y-5 px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">جزئیات مقاله</h1>
        <Link href="/dashboard/blogs" className="rounded-xl bg-gray-200 px-4 py-2 dark:bg-gray-700">بازگشت</Link>
      </div>
      {blog.imageUrl && <img src={blog.imageUrl} alt={blog.title} className="max-h-80 w-full rounded-2xl object-cover" />}
      <section className="space-y-4 rounded-2xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-bold">{blog.title}</h2>
        <p className="text-sm text-gray-500">نویسنده: {blog.firstName} {blog.lastName} · وضعیت: {statusLabels[blog.status]}</p>
        <p className="whitespace-pre-wrap leading-8">{blog.text}</p>
        <p className="text-xs text-gray-500">ایجاد: {new Date(blog.createdAt).toLocaleString("fa-IR")} {blog.updatedAt ? `· آخرین ویرایش: ${new Date(blog.updatedAt).toLocaleString("fa-IR")}` : ""}</p>
      </section>
      <div className="flex flex-wrap gap-3">
        {blog.status === 1 && <Link href={`/dashboard/blogs/${id}/edit`} className="rounded-xl bg-amber-600 px-4 py-3 text-white">ویرایش</Link>}
        {blog.status === 1 && <button disabled={busy} onClick={() => void changeStatus("publish")} className="rounded-xl bg-emerald-700 px-4 py-3 text-white">انتشار</button>}
        {blog.status === 2 && <button disabled={busy} onClick={() => void changeStatus("unpublish")} className="rounded-xl bg-amber-600 px-4 py-3 text-white">لغو انتشار</button>}
        {blog.status !== 3 && <button disabled={busy} onClick={() => void changeStatus("archive")} className="rounded-xl bg-red-700 px-4 py-3 text-white">بایگانی</button>}
        {blog.status === 3 && <button disabled={busy} onClick={() => void changeStatus("restore")} className="rounded-xl bg-blue-700 px-4 py-3 text-white">بازیابی از بایگانی</button>}
      </div>
    </main>
  );
}
