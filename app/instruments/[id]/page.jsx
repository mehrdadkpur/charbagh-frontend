"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import RoutesHeader from "@/app/ui/components/RoutesHeader";
import { fetchInstrument } from "@/lib/requests";
import { API_BASE_URL } from "@/lib/config";
import Loading from "@/app/loading";
import ErrorHandling from "@/app/ui/components/ErrorHandling";

function resolveImage(url) {
  if (!url) return "/images/instruments/پیانو.png";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `${API_BASE_URL}/${url}`;
}

export default function InstrumentDetailsPage() {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchInstrument(id)
      .then((data) => { if (active) setInstrument(data); })
      .catch((error) => console.error("خطا در دریافت ساز:", error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (instrument?.name) document.title = `معرفی ساز ${instrument.name} | چهارباغ`;
  }, [instrument]);

  if (loading) return <Loading />;
  if (!instrument || !instrument.isActive) return <ErrorHandling />;

  const imageUrl = resolveImage(instrument.imageUrl);

  return (
    <section className="w-full bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="سازشناسی" boldText="آشنایی با ساز" Highlight={instrument.name} />
      <main className="container mx-auto grid gap-8 px-4 pb-16 md:grid-cols-[minmax(240px,380px)_1fr] md:items-center">
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <Image src={imageUrl} alt={`ساز ${instrument.name}`} width={360} height={360} unoptimized={imageUrl.startsWith("http")} className="max-h-[360px] w-auto object-contain" priority />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800 md:p-9">
          {instrument.englishName && <p dir="ltr" className="mb-3 text-left text-sm text-gray-500">{instrument.englishName}</p>}
          <h1 className="mb-5 text-3xl font-MorabbaBold">{instrument.name}</h1>
          <p className="whitespace-pre-line text-base leading-9 text-gray-700 dark:text-gray-300">{instrument.description || "توضیحات این ساز هنوز ثبت نشده است."}</p>
        </div>
      </main>
      <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="" className="w-full" />
    </section>
  );
}
