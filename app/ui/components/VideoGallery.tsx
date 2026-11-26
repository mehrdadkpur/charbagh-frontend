"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAllVideos } from "@/lib/requests";
import type { CmsGalleryItem } from "@/lib/contentTypes";

function getVideoSource(url: string) {
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { kind: "file" as const, url };
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return { kind: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}` };
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      if (id) return { kind: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return { kind: "embed" as const, url: `https://player.vimeo.com/video/${id}` };
    }
  } catch {}
  return { kind: "link" as const, url };
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<CmsGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAllVideos()
      .then((data) => { if (active) setVideos(Array.isArray(data) ? data : data?.$values ?? []); })
      .catch((error) => { console.error("خطا در دریافت ویدئوها:", error); if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="container mx-auto flex-1 px-4 py-8">
      {loading ? <p role="status" className="py-16 text-center">در حال دریافت ویدئوها...</p> : failed ? (
        <p role="alert" className="py-16 text-center text-red-600">دریافت ویدئوها با مشکل مواجه شد. لطفاً دوباره تلاش کنید.</p>
      ) : videos.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center text-lg text-gray-500">هنوز ویدئویی در گالری‌های منتشرشده ثبت نشده است.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const source = getVideoSource(video.fileUrl);
            return (
              <article key={video.id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
                {source.kind === "file" ? (
                  <video src={source.url} controls preload="metadata" poster={video.thumbnailUrl || undefined} className="aspect-video w-full bg-black" />
                ) : source.kind === "embed" ? (
                  <div className="aspect-video bg-black"><iframe src={source.url} title={video.title || "ویدئوی گالری"} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gray-100 dark:bg-gray-700"><a href={source.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-elf underline dark:text-mango">مشاهده ویدئو</a></div>
                )}
                <div className="space-y-1 p-4"><h3 className="font-semibold">{video.title || "بدون عنوان"}</h3>{video.description && <p className="text-sm leading-7 text-gray-500 dark:text-gray-300">{video.description}</p>}</div>
              </article>
            );
          })}
        </div>
      )}
      <div className="mt-8 text-center"><Link href="/galleries" className="inline-flex rounded-full bg-elf px-6 py-3 text-sm font-semibold text-white hover:bg-green-800">بازگشت به گالری</Link></div>
    </main>
  );
}
