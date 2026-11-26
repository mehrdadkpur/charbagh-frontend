"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import RoutesHeader from "@/app/ui/components/RoutesHeader";
import Loading from "@/app/loading";
import ErrorHandling from "@/app/ui/components/ErrorHandling";
import { fetchBook } from "@/lib/requests";
import { API_BASE_URL } from "@/lib/config";
import type { PublicBook } from "@/lib/contentTypes";

function resolveImage(url: string | null) {
  if (!url) return "/images/songs/book.png";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `${API_BASE_URL}/${url}`;
}

export default function BookDetailsPage() {
  const params = useParams<{ id: string }>();
  const [book, setBook] = useState<PublicBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBook(params.id)
      .then((data: PublicBook) => { if (active) setBook(data); })
      .catch(() => { if (active) setBook(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  useEffect(() => {
    if (book) document.title = `${book.title} | منابع آموزشی چهارباغ`;
  }, [book]);

  if (loading) return <Loading />;
  if (!book || !book.isActive) return <ErrorHandling />;

  const imageUrl = resolveImage(book.coverImageUrl);

  return (
    <section className="w-full bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="منابع آموزشی" boldText="جزئیات کتاب" Highlight={book.title} />
      <main className="container mx-auto grid gap-8 px-4 pb-16 md:grid-cols-[minmax(240px,360px)_1fr] md:items-start">
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <Image src={imageUrl} alt={`جلد کتاب ${book.title}`} width={320} height={380} unoptimized={imageUrl.startsWith("http")} className="max-h-[380px] w-auto object-contain" priority />
        </div>
        <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800 md:p-9">
          <h1 className="text-2xl font-MorabbaBold md:text-4xl">{book.title}</h1>
          {book.englishTitle && <p dir="ltr" className="text-left text-gray-500">{book.englishTitle}</p>}
          <dl className="space-y-4 text-sm leading-7">
            {book.author && <div><dt className="text-gray-500">نویسنده</dt><dd className="font-semibold">{book.author}</dd></div>}
            {book.publisher && <div><dt className="text-gray-500">ناشر</dt><dd className="font-semibold">{book.publisher}</dd></div>}
            {book.volume !== null && <div><dt className="text-gray-500">جلد</dt><dd className="font-semibold">{book.volume}</dd></div>}
          </dl>
          <Link href="/courses" className="inline-flex rounded-full bg-elf px-6 py-3 text-sm font-semibold text-white hover:bg-green-800">بازگشت به منابع آموزشی</Link>
        </div>
      </main>
    </section>
  );
}
