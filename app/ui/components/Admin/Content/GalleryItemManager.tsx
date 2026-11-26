"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsGallery, CmsGalleryItem, GalleryMediaType } from "@/lib/contentTypes";

type Props = { mediaType: GalleryMediaType; title: string; basePath: string };

export default function GalleryItemManager({ mediaType, title, basePath }: Props) {
  const [items, setItems] = useState<CmsGalleryItem[]>([]);
  const [galleries, setGalleries] = useState<CmsGallery[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [allItems, allGalleries] = await Promise.all([
        apiFetch<CmsGalleryItem[]>("/api/GalleryItems"),
        apiFetch<CmsGallery[]>("/api/Galleries"),
      ]);
      setItems(allItems.filter((item) => item.mediaType === mediaType));
      setGalleries(allGalleries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "دریافت رسانه‌ها ناموفق بود.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [mediaType]);

  const filtered = useMemo(() => items.filter((item) =>
    `${item.title ?? ""} ${item.description ?? ""} ${item.fileUrl}`.toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  const remove = async (item: CmsGalleryItem) => {
    if (!window.confirm("این رسانه از گالری حذف شود؟")) return;
    try {
      await apiFetch<void>(`/api/GalleryItems/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((x) => x.id !== item.id));
      toast.success("رسانه حذف شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف رسانه ناموفق بود.");
    }
  };

  const galleryNames = new Map(galleries.map((gallery) => [gallery.id, gallery.title]));

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-7xl space-y-5 px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/galleries" className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-700">مدیریت گالری‌ها</Link>
          <Link href={`${basePath}/add-${mediaType === 1 ? "photo" : "video"}`} className="rounded-lg bg-blue-600 px-4 py-2 text-white">افزودن {mediaType === 1 ? "تصویر" : "ویدئو"}</Link>
        </div>
      </div>
      {galleries.length === 0 && !loading && <p className="rounded-xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">ابتدا یک گالری بسازید، سپس رسانه را به آن اضافه کنید.</p>}
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی عنوان، توضیحات یا آدرس" className="w-full rounded-xl border bg-transparent p-3" />
      {loading ? <p className="py-10 text-center">در حال دریافت رسانه‌ها...</p> : filtered.length === 0 ? <p className="py-10 text-center text-gray-500">رسانه‌ای پیدا نشد.</p> : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="p-3 text-right">عنوان</th><th className="p-3 text-right">گالری</th><th className="p-3 text-right">آدرس فایل</th><th className="p-3 text-right">ترتیب</th><th className="p-3">عملیات</th></tr></thead>
            <tbody>{filtered.map((item) => (
              <tr key={item.id} className="border-t dark:border-gray-700">
                <td className="p-3 font-semibold">{item.title || "بدون عنوان"}</td>
                <td className="p-3">{galleryNames.get(item.galleryId) ?? "گالری نامشخص"}</td>
                <td className="max-w-xs truncate p-3" dir="ltr">{item.fileUrl}</td>
                <td className="p-3">{item.sortOrder}</td>
                <td className="p-3"><div className="flex justify-center gap-2">
                  <Link href={`${basePath}/${item.id}`} className="rounded-lg bg-emerald-700 px-3 py-2 text-white">مشاهده</Link>
                  <Link href={`${basePath}/${item.id}/edit-${mediaType === 1 ? "photo" : "video"}`} className="rounded-lg bg-amber-600 px-3 py-2 text-white">ویرایش</Link>
                  <button onClick={() => void remove(item)} className="rounded-lg bg-red-700 px-3 py-2 text-white">حذف</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
