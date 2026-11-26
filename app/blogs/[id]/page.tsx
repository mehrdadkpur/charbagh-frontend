"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchBlog } from "@/lib/requests";
import Loading from "@/app/loading";
import RoutesHeader from "@/app/ui/components/RoutesHeader";
import Image from "next/image";
import ErrorHandling from "@/app/ui/components/ErrorHandling";
import type { CmsBlog } from "@/lib/contentTypes";
import { ShamsiDate } from "@/lib/shamsiDate";

export default function BlogDetailsPage() {
  const params = useParams<{ id: string }>();
  const [blog, setBlog] = useState<CmsBlog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchBlog(params.id)
      .then((data: CmsBlog) => { if (active) setBlog(data); })
      .catch((error) => console.error("خطا در دریافت مقاله:", error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  useEffect(() => {
    if (blog && typeof document !== "undefined") document.title = blog.title;
  }, [blog]);

  if (loading) return <Loading />;
  if (!blog) return <ErrorHandling />;

  return (
    <section className="bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="خبرنامه" boldText="پست‌های منتخب" Highlight={blog.title} />
      <div className="container mx-auto flex flex-col items-center px-4 pb-16">
        {blog.imageUrl && <div className="relative mt-8 h-64 w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-2 dark:bg-gray-700 md:h-96"><Image src={blog.imageUrl} alt={blog.title} fill unoptimized={blog.imageUrl.startsWith("http")} className="rounded-3xl object-contain" /></div>}
        <article className="mt-10 w-full max-w-4xl whitespace-pre-wrap text-justify text-base leading-10 text-[#152420]/80 dark:text-gray-50">{blog.text}</article>
        <p className="mt-10 w-full max-w-4xl text-sm text-gray-600 dark:text-gray-300">نوشته شده توسط: {blog.firstName} {blog.lastName} · {ShamsiDate(blog.createdAt)}</p>
      </div>
      <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="footer shape" className="w-full" />
    </section>
  );
}
