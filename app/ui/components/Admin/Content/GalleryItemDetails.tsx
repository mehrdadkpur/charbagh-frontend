"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsGallery, CmsGalleryItem, GalleryMediaType } from "@/lib/contentTypes";

type Props = { mediaType: GalleryMediaType };

export default function GalleryItemDetails({ mediaType }: Props) {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<CmsGalleryItem | null>(null);
  const [gallery, setGallery] = useState<CmsGallery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<CmsGalleryItem>(`/api/GalleryItems/${id}`),
      apiFetch<CmsGallery[]>("/api/Galleries"),
    ]).then(([media, galleries]) => {
      if (!active) return;
      if (media.mediaType !== mediaType) throw new Error("نوع رسانه با این صفحه مطابقت ندارد.");
      setItem(media);
      setGallery(galleries.find((entry) => entry.id === media.galleryId) ?? null);
    }).catch((error) => toast.error(error instanceof Error ? error.message : "دریافت جزئیات ناموفق بود."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, mediaType]);

  if (loading) return <p className="p-8 text-center">در حال بارگذاری...</p>;
  if (!item) return <p className="p-8 text-center">رسانه پیدا نشد.</p>;

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-4xl space-y-5 px-4 pb-10">
      <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-bold">جزئیات {mediaType === 1 ? "تصویر" : "ویدئو"}</h1><Link href={`/dashboard/galleries/${mediaType === 1 ? "photos" : "videos"}`} className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-700">بازگشت</Link></div>
      {mediaType === 1 ? <img src={item.fileUrl} alt={item.title ?? "تصویر گالری"} className="max-h-[520px] w-full rounded-2xl object-contain" /> : <div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={item.fileUrl} title={item.title ?? "ویدئوی گالری"} className="h-full w-full" allowFullScreen /></div>}
      <section className="space-y-3 rounded-2xl border bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-bold">{item.title || "بدون عنوان"}</h2>
        <p className="text-sm text-gray-500">گالری: {gallery?.title ?? "نامشخص"}</p>
        <p className="leading-7">{item.description || "بدون توضیحات"}</p>
        <p className="text-xs text-gray-500">ترتیب نمایش: {item.sortOrder}</p>
        <p dir="ltr" className="break-all text-xs text-gray-500">{item.fileUrl}</p>
      </section>
      <Link href={`/dashboard/galleries/${mediaType === 1 ? "photos" : "videos"}/${id}/edit-${mediaType === 1 ? "photo" : "video"}`} className="inline-block rounded-lg bg-amber-600 px-5 py-3 text-white">ویرایش رسانه</Link>
    </main>
  );
}
