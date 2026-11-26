"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPublicGallery, fetchPublicGalleryItems } from "@/lib/requests";
import type { CmsGallery, CmsGalleryItem } from "@/lib/contentTypes";
import RoutesHeader from "@/app/ui/components/RoutesHeader";

function getVideoSource(url: string) {
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { kind: "file" as const, url };
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return { kind: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}` };
    }
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v") || parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      if (videoId) return { kind: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${videoId}` };
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      if (videoId && /^\d+$/.test(videoId)) return { kind: "embed" as const, url: `https://player.vimeo.com/video/${videoId}` };
    }
  } catch {
    // Invalid URLs are rendered as a link instead of being embedded.
  }
  return { kind: "link" as const, url };
}

export default function PublicGalleryDetailsPage() {
  const params = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<CmsGallery | null>(null);
  const [items, setItems] = useState<CmsGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    Promise.all([fetchPublicGallery(params.id), fetchPublicGalleryItems(params.id)])
      .then(([galleryData, itemData]) => {
        if (!active) return;
        setGallery(galleryData);
        setItems(Array.isArray(itemData) ? itemData : itemData?.$values ?? []);
      })
      .catch((error) => {
        console.error("خطا در دریافت گالری:", error);
        if (active) setFailed(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  useEffect(() => {
    if (gallery?.title) document.title = `${gallery.title} | گالری چهارباغ`;
  }, [gallery]);

  if (loading) return <p role="status" className="p-12 text-center">در حال دریافت گالری...</p>;
  if (failed || !gallery) {
    return <section className="bg-[#F6F4EE] py-20 text-center dark:bg-gray-900"><p className="mb-5">گالری پیدا نشد یا در حال حاضر در دسترس نیست.</p><Link href="/galleries" className="text-elf underline dark:text-mango">بازگشت به گالری‌ها</Link></section>;
  }

  return (
    <section className="bg-[#F6F4EE] pb-12 dark:bg-gray-900">
      <RoutesHeader pageTitle="گالری" boldText="مجموعه" Highlight={gallery.title} />
      <main className="container mx-auto space-y-6 px-4 py-8">
        {gallery.description && <p className="mx-auto max-w-3xl text-center leading-8 text-gray-600 dark:text-gray-300">{gallery.description}</p>}
        {items.length === 0 ? <p className="py-16 text-center">هنوز رسانه‌ای به این گالری اضافه نشده است.</p> : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const video = item.mediaType === 2 ? getVideoSource(item.fileUrl) : null;
              return (
                <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
                  {item.mediaType === 1 ? (
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-700"><Image fill src={item.fileUrl} alt={item.title || "تصویر گالری"} unoptimized className="object-contain" /></div>
                  ) : video?.kind === "file" ? (
                    <video src={video.url} controls preload="metadata" poster={item.thumbnailUrl || undefined} className="aspect-video w-full bg-black" />
                  ) : video?.kind === "embed" ? (
                    <div className="aspect-video bg-black"><iframe src={video.url} title={item.title || "ویدئوی گالری"} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gray-100 dark:bg-gray-700"><a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-elf underline dark:text-mango">مشاهده ویدئو</a></div>
                  )}
                  <div className="p-4"><h2 className="font-bold">{item.title || "بدون عنوان"}</h2>{item.description && <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-300">{item.description}</p>}</div>
                </article>
              );
            })}
          </div>
        )}
        <div className="text-center"><Link href="/galleries" className="inline-flex rounded-full bg-elf px-6 py-3 text-sm font-semibold text-white hover:bg-green-800">بازگشت به گالری‌ها</Link></div>
      </main>
    </section>
  );
}
