import { API_BASE_URL } from "@/lib/config";
import type { PublicBook } from "@/lib/contentTypes";
import Image from "next/image";
import Link from "next/link";

function resolveImage(url: string | null) {
  if (!url) return "/images/songs/book.png";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}

export default function CourseCard({ course }: { course: PublicBook }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex w-full max-w-[400px] flex-col rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
    >
      <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-[#F6F4EE] dark:bg-gray-700">
        <Image
          src={resolveImage(course.coverImageUrl)}
          alt={`جلد کتاب ${course.title}`}
          width={220}
          height={220}
          unoptimized={resolveImage(course.coverImageUrl).startsWith("http")}
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-5 space-y-2 text-center">
        <h2 className="text-lg font-DanaDemiBold text-gray-800 dark:text-gray-100">{course.title}</h2>
        {course.author && <p className="text-sm text-gray-600 dark:text-gray-300">نویسنده: {course.author}</p>}
        {course.publisher && <p className="text-xs text-gray-500 dark:text-gray-400">ناشر: {course.publisher}</p>}
        <p className="pt-2 text-sm font-semibold text-elf dark:text-mango">مشاهده جزئیات کتاب</p>
      </div>
    </Link>
  );
}
