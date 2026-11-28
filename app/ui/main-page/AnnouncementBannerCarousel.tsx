"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";

type PublicBanner = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
};

export default function AnnouncementBannerCarousel() {
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/Banners/active`, { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Failed to load announcement banners");
        const data = await response.json();
        return data?.$values ?? data;
      })
      .then((items: PublicBanner[]) => {
        if (!cancelled && Array.isArray(items)) setBanners(items);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % banners.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const banner = banners[activeIndex] ?? banners[0];

  return (
    <section dir="rtl" aria-label="بنرهای اطلاع‌رسانی" className="mx-auto w-full max-w-7xl px-4 pt-5 md:pt-8">
      <div className="relative isolate min-h-[230px] overflow-hidden rounded-3xl bg-elf shadow-lg md:min-h-[360px]">
        <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-gray-950/85 via-gray-950/55 to-gray-950/10" />
        <div className="flex min-h-[230px] max-w-2xl flex-col items-start justify-center px-6 py-10 text-white sm:px-10 md:min-h-[360px] md:px-14">
          <span className="mb-3 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs backdrop-blur">اطلاعیه و رویدادها</span>
          <h2 className="text-2xl font-extrabold leading-relaxed sm:text-3xl md:text-5xl">{banner.title}</h2>
          {banner.description && <p className="mt-3 max-w-xl text-sm leading-7 text-white/90 sm:text-base md:mt-5">{banner.description}</p>}
          {banner.linkUrl && <a href={banner.linkUrl} className="mt-5 inline-flex rounded-xl bg-mango px-5 py-3 text-sm font-bold text-gray-950 transition hover:brightness-95">{banner.buttonText || "اطلاعات بیشتر"}</a>}
        </div>
        {banners.length > 1 && (
          <>
            <div className="absolute bottom-4 left-5 flex items-center gap-2">
              {banners.map((item,index) => <button key={item.id} type="button" aria-label={`نمایش بنر ${index+1}`} aria-current={index===activeIndex} onClick={() => setActiveIndex(index)} className={`h-2.5 rounded-full transition-all ${index===activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/55"}`} />)}
            </div>
            <div className="absolute bottom-4 right-5 flex gap-2">
              <button type="button" aria-label="بنر قبلی" onClick={() => setActiveIndex(index => (index - 1 + banners.length) % banners.length)} className="flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55">›</button>
              <button type="button" aria-label="بنر بعدی" onClick={() => setActiveIndex(index => (index + 1) % banners.length)} className="flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55">‹</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
