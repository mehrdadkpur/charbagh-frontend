"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { fetchTeacher } from "@/lib/requests";
import { API_BASE_URL } from "@/lib/config";
import type { PublicTeacher } from "@/lib/contentTypes";
import Loading from "@/app/loading";
import RoutesHeader from "@/app/ui/components/RoutesHeader";
import ErrorHandling from "@/app/ui/components/ErrorHandling";

function resolveImage(url: string | null) {
  if (!url) return "/images/avatar.png";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `${API_BASE_URL}/${url}`;
}

export default function TeacherDetailsPage() {
  const params = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<PublicTeacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTeacher(params.id)
      .then((data: PublicTeacher) => { if (active) setTeacher(data); })
      .catch(() => { if (active) setTeacher(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  useEffect(() => {
    if (teacher) document.title = `رزومه ${teacher.firstName} ${teacher.lastName} | چهارباغ`;
  }, [teacher]);

  if (loading) return <Loading />;
  if (!teacher || teacher.status !== 1) return <ErrorHandling />;

  const imageUrl = resolveImage(teacher.profileImageUrl);

  return (
    <section className="bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="مدرسین" boldText="آشنایی با مدرس" Highlight={`${teacher.firstName} ${teacher.lastName}`} />
      <main className="container mx-auto grid gap-8 px-4 pb-16 md:grid-cols-[280px_1fr] md:items-start">
        <div className="flex justify-center rounded-3xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <Image src={imageUrl} alt={`تصویر ${teacher.firstName} ${teacher.lastName}`} width={260} height={260} unoptimized={imageUrl.startsWith("http")} className="aspect-square rounded-2xl object-cover" priority />
        </div>
        <article className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800 md:p-9">
          <h1 className="mb-5 text-2xl font-DanaDemiBold">{teacher.firstName} {teacher.lastName}</h1>
          {teacher.experienceYears !== null && <p className="mb-4 text-sm text-elf dark:text-mango">{teacher.experienceYears} سال سابقه آموزشی</p>}
          {teacher.education !== null && <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">میزان تحصیلات: {teacher.education}</p>}
          <h2 className="mb-3 text-lg font-DanaDemiBold">درباره مدرس</h2>
          <p className="whitespace-pre-line text-base leading-9 text-gray-700 dark:text-gray-300">{teacher.biography || "زندگی‌نامه این مدرس هنوز ثبت نشده است."}</p>
        </article>
      </main>
    </section>
  );
}
