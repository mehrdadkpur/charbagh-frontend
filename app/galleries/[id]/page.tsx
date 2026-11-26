"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPublicGallery, fetchPublicGalleryItems } from "@/lib/requests";
import type { CmsGallery, CmsGalleryItem } from "@/lib/contentTypes";
import RoutesHeader from "@/app/ui/components/RoutesHeader";

export default function PublicGalleryDetailsPage() {
  const params = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<CmsGallery | null>(null);
  const [items, setItems] = useState<CmsGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPublicGallery(params.id), fetchPublicGalleryItems(params.id)])
      .then(([galleryData, itemData]) => {
        if (!active) return;
        setGallery(galleryData);
        setItems(itemData);
      })
      .catch((error) => console.error("خطا در دریافت گالری:", error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  if (loading) return <p className="p-12 text-center">در حال دریافت گالری...</p>;
  if (!gallery) return <p className="p-12 text-center">گالری پیدا نشد یا منتشر نشده است.</p>;

  return (
    <section className="bg-[#F6F4EE] pb-12 dark:bg-gray-900">
      <RoutesHeader pageTitle="گالری" boldText="مجموعه" Highlight={gallery.title} />
      <main className="container mx-auto space-y-6 px-4 py-8">
        {gallery.description && <p className="text-center text-gray-600 dark:text-gray-300">{gallery.description}</p>}
        {items.length === 0 ? <p className="py-16 text-center">هنوز رسانه‌ای به این گالری اضافه نشده است.</p> : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
                {item.mediaType === 1 ? (
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700"><Image fill src={item.fileUrl} alt={item.title ?? "تصویر گالری"} unoptimized className="object-contain" /></div>
                ) : (
                  <div className="aspect-video bg-black"><iframe src={item.fileUrl} title={item.title ?? "ویدئوی گالری"} className="h-full w-full" allowFullScreen /></div>
                )}
                <div className="p-4"><h2 className="font-bold">{item.title || "بدون عنوان"}</h2>{item.description && <p className="mt-2 text-sm text-gray-500">{item.description}</p>}</div>
              </article>
            ))}
          </div>
        )}
        <div className="text-center"><Link href="/galleries" className="inline-block rounded-lg bg-red-600 px-6 py-3 text-white">بازگشت به گالری‌ها</Link></div>
      </main>
    </section>
  );
}
