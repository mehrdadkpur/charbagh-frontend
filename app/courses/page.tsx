import { fetchBooks } from "@/lib/requests";
import CourseCard from "../ui/components/CourseCard";
import RoutesHeader from "../ui/components/RoutesHeader";
import Image from "next/image";
import type { PublicBook } from "@/lib/contentTypes";

export const metadata = {
  title: "کتاب‌های آموزشی | آموزشگاه موسیقی چهارباغ",
  description: "فهرست کتاب‌ها و منابع آموزشی موسیقی در آموزشگاه چهارباغ.",
};

export default async function CoursesPage() {
  const books = (await fetchBooks()) as PublicBook[];
  const activeBooks = books.filter((book) => book.isActive);

  return (
    <section className="relative w-full bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="منابع آموزشی" boldText="کتاب‌ها و منابع" Highlight="یادگیری موسیقی" />
      <div className="container mx-auto px-4">
        {activeBooks.length ? (
          <div className="my-12 grid justify-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {activeBooks.map((book) => <CourseCard key={book.id} course={book} />)}
          </div>
        ) : (
          <div className="my-16 rounded-2xl bg-white p-10 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            در حال حاضر منبع آموزشی فعالی برای نمایش وجود ندارد.
          </div>
        )}
      </div>
      <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="" className="w-full" />
    </section>
  );
}
