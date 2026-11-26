"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAllVideos } from "@/lib/requests";
import type { CmsGalleryItem } from "@/lib/contentTypes";

export default function VideoGallery() {
  const [videos, setVideos] = useState<CmsGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllVideos()
      .then(setVideos)
      .catch((error) => console.error("خطا در دریافت ویدئوها:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 p-4">
      {loading ? <p className="py-16 text-center">در حال دریافت ویدئوها...</p> : videos.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-lg">هنوز ویدئویی در گالری‌های منتشرشده ثبت نشده است.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
              <div className="aspect-video bg-black"><iframe src={video.fileUrl} title={video.title ?? "ویدئوی گالری"} className="h-full w-full" allowFullScreen /></div>
              <div className="space-y-1 p-3"><h3 className="font-semibold">{video.title || "بدون عنوان"}</h3>{video.description && <p className="text-sm text-gray-500">{video.description}</p>}</div>
            </article>
          ))}
        </div>
      )}
      <div className="mx-auto mt-8 w-40 text-center"><Link href="/galleries" className="block rounded-lg bg-red-600 p-2 text-white">بازگشت به گالری</Link></div>
    </main>
  );
}
