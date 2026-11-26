"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPhotos } from "@/lib/requests";
import type { CmsGalleryItem } from "@/lib/contentTypes";

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<CmsGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos()
      .then(setPhotos)
      .catch((error) => console.error("خطا در دریافت تصاویر:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 p-4">
      {loading ? <p className="py-16 text-center">در حال دریافت تصاویر...</p> : photos.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-lg">هنوز تصویری در گالری‌های منتشرشده ثبت نشده است.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {photos.map((photo) => (
            <article key={photo.id} className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
              <div className="aspect-square overflow-hidden">
                <img src={photo.fileUrl} alt={photo.title ?? "تصویر گالری"} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="space-y-1 p-3">
                <h3 className="font-semibold">{photo.title || "بدون عنوان"}</h3>
                {photo.description && <p className="line-clamp-2 text-xs text-gray-500">{photo.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="mx-auto mt-8 w-40 text-center"><Link href="/galleries" className="block rounded-lg bg-red-600 p-2 text-white">بازگشت به گالری</Link></div>
    </main>
  );
}
