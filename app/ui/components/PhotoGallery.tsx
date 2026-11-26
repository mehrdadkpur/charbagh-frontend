"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPhotos } from "@/lib/requests";
import type { CmsGalleryItem } from "@/lib/contentTypes";

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<CmsGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPhotos()
      .then((data) => { if (active) setPhotos(Array.isArray(data) ? data : data?.$values ?? []); })
      .catch((error) => { console.error("خطا در دریافت تصاویر:", error); if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="container mx-auto flex-1 px-4 py-8">
      {loading ? <p role="status" className="py-16 text-center">در حال دریافت تصاویر...</p> : failed ? (
        <p role="alert" className="py-16 text-center text-red-600">دریافت تصاویر با مشکل مواجه شد. لطفاً دوباره تلاش کنید.</p>
      ) : photos.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center text-lg text-gray-500">هنوز تصویری در گالری‌های منتشرشده ثبت نشده است.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {photos.map((photo) => (
            <article key={photo.id} className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
              <a href={photo.fileUrl} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img src={photo.fileUrl} alt={photo.title || "تصویر گالری آموزشگاه"} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </a>
              <div className="space-y-1 p-3">
                <h3 className="font-semibold">{photo.title || "بدون عنوان"}</h3>
                {photo.description && <p className="line-clamp-2 text-xs leading-6 text-gray-500 dark:text-gray-300">{photo.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="mt-8 text-center"><Link href="/galleries" className="inline-flex rounded-full bg-elf px-6 py-3 text-sm font-semibold text-white hover:bg-green-800">بازگشت به گالری</Link></div>
    </main>
  );
}
