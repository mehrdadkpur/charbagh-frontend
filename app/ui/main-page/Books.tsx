import Link from "next/link";
import Image from "next/image";
import { fetchBooks } from "@/lib/requests";
import CourseCard from "@/app/ui/components/CourseCard";
import type { PublicBook } from "@/lib/contentTypes";

export default async function Books() {
  const books = (await fetchBooks()) as PublicBook[];
  const activeBooks = books.filter((book) => book.isActive);

  return (
    <section className="flex w-full flex-col justify-between bg-[#F6F4EE] pt-3 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col items-center">
          <div className="w-full max-w-2xl text-center">
            <p className="text-xs font-DanaMedium text-elf md:text-lg">منابع آموزشی</p>
            <h2 className="mt-3 text-3xl font-MorabbaBold leading-relaxed text-gray-900 dark:text-gray-50 md:text-5xl">
              کتاب‌هایی برای یادگیری و تمرین موسیقی
            </h2>
          </div>

          <div className="my-12 grid w-full justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-3">
            {activeBooks.slice(0, 3).map((book) => <CourseCard key={book.id} course={book} />)}
            {!activeBooks.length && <p className="col-span-full py-8 text-center text-gray-500">منبع آموزشی فعالی برای نمایش وجود ندارد.</p>}
          </div>

          <Link href="/courses" className="mb-8 rounded-full bg-mango px-6 py-3 text-sm font-DanaMedium text-gray-900 transition hover:bg-elf hover:text-white dark:bg-elf dark:text-white dark:hover:bg-mango">
            مشاهده همه کتاب‌ها
          </Link>
        </div>
      </div>
      <Image src="/images/shapes/courses.png" alt="" width={1920} height={169} className="block w-full dark:hidden" />
      <Image src="/images/shapes/courses-dark-1.png" alt="" width={1920} height={169} className="hidden w-full dark:block" />
    </section>
  );
}
