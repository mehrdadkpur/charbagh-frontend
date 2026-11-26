"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsGallery } from "@/lib/contentTypes";

const statusLabels: Record<number, string> = { 1: "پیش‌نویس", 2: "منتشرشده", 3: "بایگانی‌شده" };

export default function GalleryCollectionsManager() {
  const [galleries, setGalleries] = useState<CmsGallery[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setGalleries(await apiFetch<CmsGallery[]>("/api/Galleries")); }
    catch (error) { toast.error(error instanceof Error ? error.message : "دریافت گالری‌ها ناموفق بود."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCoverImageUrl("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...(editingId ? { id: editingId } : {}),
        title: title.trim(),
        description: description.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
      };
      if (editingId) {
        await apiFetch<CmsGallery>(`/api/Galleries/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
        toast.success("گالری ویرایش شد.");
      } else {
        await apiFetch<CmsGallery>("/api/Galleries", { method: "POST", body: JSON.stringify(body) });
        toast.success("گالری ایجاد شد.");
      }
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیره گالری ناموفق بود.");
    } finally { setSaving(false); }
  };

  const startEdit = (gallery: CmsGallery) => {
    setEditingId(gallery.id);
    setTitle(gallery.title);
    setDescription(gallery.description ?? "");
    setCoverImageUrl(gallery.coverImageUrl ?? "");
  };

  const changeStatus = async (gallery: CmsGallery, action: "publish" | "unpublish" | "archive" | "restore") => {
    try {
      await apiFetch<CmsGallery>(`/api/Galleries/${gallery.id}/${action}`, { method: "PATCH" });
      toast.success("وضعیت گالری تغییر کرد.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود.");
    }
  };

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-6xl space-y-6 px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">مدیریت گالری‌ها</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/galleries/photos" className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-700">تصاویر</Link>
          <Link href="/dashboard/galleries/videos" className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-700">ویدئوها</Link>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-5 dark:border-gray-700 dark:bg-gray-900 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-bold">{editingId ? "ویرایش گالری" : "ایجاد گالری جدید"}</h2>
        <label className="space-y-2"><span className="block text-sm">عنوان گالری</span><input required value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border bg-transparent p-3" /></label>
        <label className="space-y-2"><span className="block text-sm">آدرس تصویر کاور (اختیاری)</span><input type="url" value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} className="w-full rounded-lg border bg-transparent p-3" /></label>
        <label className="space-y-2 md:col-span-2"><span className="block text-sm">توضیحات</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border bg-transparent p-3" /></label>
        <div className="md:col-span-2 flex gap-2">
          <button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : editingId ? "ثبت ویرایش" : "ایجاد گالری"}</button>
          {editingId && <button type="button" onClick={reset} className="rounded-lg bg-gray-200 px-5 py-3 dark:bg-gray-700">لغو ویرایش</button>}
        </div>
        <p className="md:col-span-2 text-xs text-gray-500">در API فعلی بارگذاری فایل وجود ندارد؛ کاور با URL ثبت می‌شود.</p>
      </form>

      {loading ? <p className="py-8 text-center">در حال بارگذاری گالری‌ها...</p> : galleries.length === 0 ? <p className="py-8 text-center text-gray-500">هنوز گالری‌ای ایجاد نشده است.</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {galleries.map((gallery) => (
            <article key={gallery.id} className="space-y-3 rounded-2xl border bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-bold">{gallery.title}</h3><p className="mt-1 text-sm text-gray-500">{gallery.description || "بدون توضیحات"}</p></div>
                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">{statusLabels[gallery.status]}</span>
              </div>
              {gallery.coverImageUrl && <img src={gallery.coverImageUrl} alt={gallery.title} className="h-36 w-full rounded-xl object-cover" />}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => startEdit(gallery)} className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white">ویرایش</button>
                {gallery.status === 1 && <button onClick={() => void changeStatus(gallery, "publish")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white">انتشار</button>}
                {gallery.status === 2 && <button onClick={() => void changeStatus(gallery, "unpublish")} className="rounded-lg bg-amber-700 px-3 py-2 text-sm text-white">لغو انتشار</button>}
                {gallery.status !== 3 && <button onClick={() => void changeStatus(gallery, "archive")} className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white">بایگانی</button>}
                {gallery.status === 3 && <button onClick={() => void changeStatus(gallery, "restore")} className="rounded-lg bg-blue-700 px-3 py-2 text-sm text-white">بازیابی</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
